
function getAlphaCodeForColumnVisibleLight(columnData) {
    let totalAlpha = 0;

    for (let i = 0; i < columnData.length; i += 5) {
        totalAlpha += columnData[i];
    }

    const averageAlpha = totalAlpha / (columnData.length / 5 / 5);

    return {averageAlpha};
}



function drawGraphVL() {
    const scalingFactor = 50;
    const scalingFactorPeak = 20;


    ctx2.clearRect(0, 0, canvasgraph.width, canvasgraph.height);

    ctx2.beginPath();
    canvasgraph.width = canvas.width;
    canvasgraph.height = canvas.height;
    ctx2.fillStyle = 'white';
    ctx2.moveTo(0, 0);
    ctx2.lineTo(0, canvasgraph.height);
    ctx2.lineTo(canvasgraph.width, canvasgraph.height);
    ctx2.stroke();
    ctx2.beginPath();

    dataPoints.forEach((point, index) => {
        let scaledY = 0;
        let wavelength = 0;
        if (point.y >= 940) {
            scaledY = canvasgraph.height - point.y / scalingFactorPeak;
            wavelength = wavelength + scaledY * (400 - 10) / 50;

        } else {
            scaledY = canvasgraph.height - point.y / scalingFactor;
        }
        const updatedX = point.x;

        wavelength = Math.round(wavelength * 100) / 100;

        wavelengths.push({x: point.x, c: wavelength});

        ctx2.lineTo(updatedX, scaledY);
    });

    // console.log(dataPoints);

    ctx2.strokeStyle = 'blue';

    ctx2.stroke();
    ctx2.fill();

    ctx2.closePath();

    return 0;

}


