export interface PasswordEntry {
  title: string;
  password: string;
}

function getSecretKey(): string {
  return document.querySelector(".secretKey")?.value;
}

document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("fileInput");
  const openFileButton = document.getElementById("openFileButton");
  const fileContentsDisplay = document.getElementById("fileContents");

  openFileButton?.addEventListener("click", function () {
    fileInput?.click(); // Programmatically click the hidden file input
  });

  fileInput?.addEventListener("change", function (event) {
    const file = (event as any).target.files[0]; // Get the selected file

    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        const json: PasswordEntry[] = JSON.parse((e as any).target.result);
        document.querySelector(".secretKey").disabled = true;
        codingFile(json);
      };

      reader.onerror = function () {
        (fileContentsDisplay as any).textContent =
          "Error: Could not read file.";
      };

      reader.readAsText(file); // Read the file as text
    } else {
      (fileContentsDisplay as any).textContent = "No file selected.";
    }
  });
});

function downloadJSON(obj: Object, filename: string): void {
  const dataUri =
    "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj));

  const anchorElement = document.createElement("a");
  anchorElement.href = dataUri;
  anchorElement.download = `${filename}.json`;

  document.body.appendChild(anchorElement);
  anchorElement.click();
  document.body.removeChild(anchorElement);
}

document.querySelector("#saveFile")?.addEventListener("click", () => {
  const items = new Array(document.querySelector(".row")).map((item) => ({
    title: coding(item?.querySelector(".title")?.value ?? "", getSecretKey()),
    password: coding(
      item?.querySelector(".password")?.value ?? "",
      getSecretKey()
    ),
  }));
  downloadJSON(items, "data-file-" + new Date().toISOString());
});

function codingFile(obj: PasswordEntry[]): void {
  let items: PasswordEntry[] = obj.map((o) => ({
    title: decoding(o.title, getSecretKey()),
    password: decoding(o.password, getSecretKey()),
  }));
  addRows(items);
}

function coding(message: string, secretKey: string): string {
  const encrypted = CryptoJS.AES.encrypt(message, secretKey);
  return encrypted.toString();
}

function decoding(encryptedString: string, secretKey: string): string {
  const decrypted = CryptoJS.AES.decrypt(encryptedString, secretKey);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

function addRows(items: PasswordEntry[]): void {
  const containerElement = document.createElement("div");
  items.forEach(({ title, password }) => {
    containerElement.appendChild(addRow(title, password));
  });
  document.querySelector(".content")?.appendChild(containerElement);
}

function addRow(title: string, password: string): HTMLElement {
  const template: any = document.getElementById("row-data") as any;
  const clone = template.content.cloneNode(true);
  clone.querySelector(".title").value = title;
  clone.querySelector(".password").value = password;
  return clone;
}
