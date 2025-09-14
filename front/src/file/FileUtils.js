import WebService from "../WebService";

class FileUtils {
  static GetFileUrl(name) {
    return WebService.URL.webService_baseAddress + name;
  }

  static DownloadFile(url, name) {
    let a = document.createElement("a");
    a.href = url;
    a.target = "blank";
    a.download = name || url.split("/").pop() || "file";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  static GetFile(callback) {
    const fileInput = document.getElementById("FormInfo__fileUpload");

    // Define a named function for the event listener
    function handleFileChange(event) {
      if (fileInput.files.length > 0) {
        callback(fileInput.files);
      } else {
        console.error("No files selected.");
      }
      // Remove the event listener after the file has been processed
      fileInput.removeEventListener("change", handleFileChange);
    }

    // Add the event listener
    fileInput.addEventListener("change", handleFileChange);

    // Trigger the file input click to open the file dialog
    fileInput.click();
  }

  static IsImage(fileName) {
    if (!fileName) return;

    const ext = fileName.split(".").pop();
    switch (ext.toLowerCase()) {
      case "jpeg":
      case "jpg":
      case "png":
      case "apng":
      case "gif":
      case "svg":
      case "bmp":
      case "webp":
      case "ico":
      case "heic":
      case "tiff":
      case "tif":
        return true;
    }
  }
}

export default FileUtils;
