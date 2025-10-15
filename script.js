const startBtn = document.getElementById("start-btn");
const homePage = document.getElementById("home-page");
const cameraSection = document.getElementById("camera-section");
const camera = document.getElementById("camera");
const captureBtn = document.getElementById("capture-btn");
const previewArea = document.getElementById("preview-area");
const downloadBtn = document.getElementById("download-btn");
const canvas = document.getElementById("canvas");

let capturedImages = [];

// Start camera
startBtn.addEventListener("click", async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
    homePage.classList.add("hidden");
    cameraSection.classList.remove("hidden");
  } catch (error) {
    alert("Camera access is required to continue 😢");
    console.error(error);
  }
});

let greyFilter = false;
const greyBtn = document.getElementById("grey-btn");

greyBtn.addEventListener("click", () => {
  greyFilter = !greyFilter; // toggle state
  greyBtn.textContent = `Grey Filter: ${greyFilter ? "ON" : "OFF"}`;
  greyBtn.classList.toggle("active", greyFilter);
});




// Capture photo
captureBtn.addEventListener("click", () => {
  const ctx = canvas.getContext("2d");
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;
  ctx.drawImage(camera, 0, 0, canvas.width, canvas.height);

  const imageData = canvas.toDataURL("image/png");
  capturedImages.push(imageData);

  if (capturedImages.length < 3) {
    alert(`Photo ${capturedImages.length} captured! Take ${3 - capturedImages.length} more.`);
  } else if (capturedImages.length === 3) {
    generatePolaroid();
  }
});



function generatePolaroid() {
  const images = capturedImages.map(src => {
    return new Promise(resolve => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img); // ensures all images are loaded
    });
  });

  Promise.all(images).then(loadedImages => {
    // Original polaroid size
    const originalWidth = 400;
    const originalHeight = 900;
    const imgHeight = 230;
    const spacing = 20;
    const marginX = 40; // margin inside the polaroid

    // Final download width (mobile & desktop friendly)
    const finalPolaroidWidth = 230;
    const scale = finalPolaroidWidth / originalWidth;
    const finalWidth = originalWidth * scale;
    const finalHeight = originalHeight * scale;

    const canvas = document.createElement("canvas");
    canvas.width = finalWidth;
    canvas.height = finalHeight;
    const ctx = canvas.getContext("2d");

    // Transparent background
    ctx.clearRect(0, 0, finalWidth, finalHeight);

    // White polaroid rectangle
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, finalWidth, finalHeight);

    // Image width with margin
    const imageWidth = finalWidth - marginX * 2 * scale;

    // Draw all images
    loadedImages.forEach((img, i) => {
      const x = marginX * scale; // left margin
      const y = (40 + (imgHeight + spacing) * i) * scale;
      ctx.drawImage(img, x, y, imageWidth, imgHeight * scale);

      // Apply grey filter if enabled
      if (greyFilter) {
        const imgData = ctx.getImageData(x, y, imageWidth, imgHeight * scale);
        const data = imgData.data;
        for (let j = 0; j < data.length; j += 4) {
          const avg = 0.3 * data[j] + 0.59 * data[j + 1] + 0.11 * data[j + 2];
          data[j] = data[j + 1] = data[j + 2] = avg;
        }
        ctx.putImageData(imgData, x, y);
      }
    });

    // Watermark/logo
    ctx.font = `${28 * scale}px Poppins, sans-serif`;
    ctx.fillStyle = "rgba(150,150,150,0.6)";
    ctx.textAlign = "right";
    ctx.fillText("PolaBooth", finalWidth - 20, finalHeight - 30);

    // Convert to PNG
    const finalImage = canvas.toDataURL("image/png");

    // Show preview
    showPolaroid(finalImage);

    // Set download button
    const downloadBtn = document.getElementById("download-btn");
    if (downloadBtn) {
      downloadBtn.onclick = () => {
        const a = document.createElement("a");
        a.href = finalImage;
        a.download = "PolaBooth.png";
        a.click();
      };
    }
  });
}


  // Show final Polaroid
  function showPolaroid(imageURL) {
    previewArea.innerHTML = `
    <div class="polaroid">
      <img src="${imageURL}" alt="Polaroid Image">
      <div class="watermark"></div>
    </div>
  `;
    downloadBtn.classList.remove("hidden");

    downloadBtn.onclick = () => {
      const link = document.createElement("a");
      link.href = imageURL;
      link.download = "my-polaroid.png";
      link.click();
    };
  }

