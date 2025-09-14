// import imageCompression from 'browser-image-compression';
import ImageCompressor from "image-compressor.js";

const Constants = {
  avatarSize: 256,
  thumbnailSize: 100,
};

class FileCompressor {
  constructor() {}

  static CompressImage(imageFile) {
    const imageCompressor = new ImageCompressor();
    return imageCompressor.compress(imageFile, {
      beforeDraw(context) {
        context.fillStyle = "#fff";
      },
      mimeType: "image/jpeg",
    });
  }

  static CompressFile(file) {
    if (file.type.match("image")) {
      return FileCompressor.CompressImage(file);
    } else {
      return file;
    }
  }

  static CreateThumbnail(file) {
    if (file && file.type.match("image")) {
      return FileCompressor.CreateImageThumbnail(file);
    } else {
      return null;
    }
  }

  static CreateImageThumbnail(imageFile) {
    const imageCompressor = new ImageCompressor();
    return imageCompressor.compress(imageFile, {
      beforeDraw(context) {
        context.fillStyle = "#fff";
      },
      mimeType: "image/jpeg",
      maxWidth: Constants.thumbnailSize,
      maxHeight: Constants.thumbnailSize,
    });
  }

  // Create thumbnail
  createThumbnail(file) {
    var time = 15; // Set specific time in second for thumbnail
    var scale = 1; // Scale image

    // Set dimensions of thumbnail
    var thumbnailDimensions = {
      width: 200,
      height: 200,
    };

    // Check only for video files
    if (!file.type.match("video")) {
      return;
    }

    var reader = new FileReader();

    reader.onload = (function(file) {
      return function(evt) {
        var video = document.createElement("video");
        video.setAttribute("src", evt.target.result);
        video.addEventListener(
          "loadedmetadata",
          function() {
            this.currentTime = time; //Set current time of video after metadat loaded
          },
          false
        );

        // Create thumbnail after video data loaded
        video.addEventListener(
          "loadeddata",
          function() {
            var canvas = document.createElement("canvas");
            canvas.width = thumbnailDimensions.width * scale;
            canvas.height = thumbnailDimensions.height * scale;
            canvas
              .getContext("2d")
              .drawImage(video, 0, 0, canvas.width, canvas.height);

            var img = document.getElementById("img");
            img.src = canvas.toDataURL();

            video.setAttribute("currentTime", 0); // Reset video current time
          },
          false
        );
      };
    })(file);

    reader.readAsDataURL(file);
  }

  // static compress(imageFile, callback) {
  //     console.log(ImageCompressor)
  //     const compressorSettings = {
  //         mimeType: 'image/jpeg',
  //     }
  //     const imageCompressor = new window.ImageCompressor;
  //     imageCompressor.run(URL.createObjectURL(imageFile), compressorSettings, callback);
  // }

  // static comp(imageFile, callback){
  //     var options = {
  //         useWebWorker: true
  //     }
  //     imageCompression(imageFile, options)
  //         .then(function (compressedFile) {
  //             console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
  //             console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB
  //
  //             return callback(compressedFile); // write your own logic
  //         })
  //         .catch(function (error) {
  //             console.log(error.message);
  //         });
  // }
}

export default FileCompressor;
