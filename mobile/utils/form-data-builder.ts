export class FormDataBuilder {
  private formData: FormData;

  constructor() {
    this.formData = new FormData();
  }

  append(key: string, value: string | Blob, filename?: string): FormDataBuilder {
    if (filename) {
      this.formData.append(key, value as Blob, filename);
    } else {
      this.formData.append(key, value as string);
    }
    return this;
  }

  appendIfExists(key: string, value: string | undefined): FormDataBuilder {
    if (value !== undefined) {
      this.formData.append(key, value);
    }
    return this;
  }

  appendArray(key: string, value: any[]): FormDataBuilder {
    this.formData.append(key, JSON.stringify(value));
    return this;
  }

  appendBoolean(key: string, value: boolean): FormDataBuilder {
    this.formData.append(key, String(value));
    return this;
  }

  build(): FormData {
    return this.formData;
  }

  reset(): FormDataBuilder {
    this.formData = new FormData();
    return this;
  }
}
