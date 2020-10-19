import { Component, OnInit } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { LoadingController } from "@ionic/angular";
import { switchMap } from "rxjs/operators";
import { PlaceLocation } from "../../location.model";
import { PlacesService } from "../../places.service";

@Component({
  selector: "app-new-offer",
  templateUrl: "./new-offer.page.html",
  styleUrls: ["./new-offer.page.scss"],
})
export class NewOfferPage implements OnInit {
  constructor(
    private placesService: PlacesService,
    private router: Router,
    private loadingCtrl: LoadingController
  ) {}

  form: FormGroup;
  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      description: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required, Validators.maxLength(180)],
      }),
      price: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required, Validators.min(100)],
      }),
      dateFrom: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      dateTo: new FormControl(null, {
        updateOn: "blur",
        validators: [Validators.required],
      }),
      location: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null),
    });
  }

  onLocationPicked(location: PlaceLocation) {
    // Update Form, but only location field
    this.form.patchValue({ location: location });
  }

  /**
   * <app-image-picker> 回傳的內容
   * @param imageData BASE64字串，或者是FILE物件
   */
  onImagePicked(imageData: string | File) {
    let imageFile;
    if (typeof imageData === "string") {
      // Convert to File
      try {
        // 重點：因為傳入的 STRING 是 DATAURL，因此要移除前面的內容
        imageFile = base64toBlob(
          imageData.replace("data:image/jpeg;base64,", ""),
          "image/jpeg"
        );
      } catch (e) {
        console.log("Convert To file Error:", e);
      }
    } else {
      imageFile = imageData;
    }
    this.form.patchValue({ image: imageFile });
  }

  async onCreateOffer() {
    if (!this.form.valid || !this.form.get("image").value) {
      return;
    }
    const loading = await this.loadingCtrl.create({
      message: "Creating Place...",
    });
    await loading.present();

    this.placesService
      .uploadImage(this.form.get("image").value)
      .pipe(
        switchMap((uploadRes) => {
          return this.placesService.addPlace(
            this.form.value.title,
            this.form.value.description,
            this.form.value.price,
            new Date(this.form.value.dateFrom),
            new Date(this.form.value.dateTo),
            this.form.value.location,
            uploadRes.imageUrl
          );
        })
      )
      .subscribe((data) => {
        console.log("take result: ", data);
        loading.dismiss();
        this.form.reset();
        this.router.navigate(["/places/tabs/offers"]);
      });
  }
}

/**
 * Convert Base-64 string to File type
 * @param base64Data
 * @param contentType
 */
function base64toBlob(base64Data, contentType) {
  contentType = contentType || "";
  const sliceSize = 1024;
  const byteCharacters = atob(base64Data);
  const bytesLength = byteCharacters.length;
  const slicesCount = Math.ceil(bytesLength / sliceSize);
  const byteArrays = new Array(slicesCount);

  for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize;
    const end = Math.min(begin + sliceSize, bytesLength);

    const bytes = new Array(end - begin);
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0);
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes);
  }
  return new Blob(byteArrays, { type: contentType });
}
