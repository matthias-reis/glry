const sharp = require('sharp');
const { resolve } = require('path');
const { writeFileSync } = require('fs');
const { log, err } = require('./log');

const sharpening = [2.125, 0.5, 2];

const BASE_PATH = 'https://storage.googleapis.com/cardamonchai-galleries';

const measure = async func => {
  const t0 = Date.now();
  const info = await func();
  return { duration: Date.now() - t0, size: info.size };
};

module.exports = async (files, tmpFolder, glryName) => {
  const transformSmall = (file, filename) =>
    sharp(file)
      .withMetadata()
      .resize(800, 800, { fit: 'inside' })
      .sharpen(...sharpening)
      .jpeg({
        quality: 40,
        chromaSubsampling: '4:4:4',
        progressive: true,
      })
      .toFile(`${resolve(tmpFolder, filename)}.s.jpg`);

  const transformMedium = (file, filename) =>
    sharp(file)
      .withMetadata()
      .resize(1024, 1024, { fit: 'inside' })
      .sharpen(...sharpening)
      .jpeg({
        quality: 70,
        chromaSubsampling: '4:4:4',
        progressive: true,
      })
      .toFile(`${resolve(tmpFolder, filename)}.m.jpg`);

  const transformLarge = (file, filename) =>
    sharp(file)
      .withMetadata()
      .resize(1960, 1960, { fit: 'inside' })
      .sharpen(...sharpening)
      .jpeg({
        quality: 65,
        chromaSubsampling: '4:4:4',
        progressive: true,
      })
      .toFile(`${resolve(tmpFolder, filename)}.l.jpg`);

  const promises = files.map(async file => {
    const filename = file
      .split('/')
      [file.split('/').length - 1].replace('.jpg', '');

    const data = await Promise.all([
      measure(() => transformSmall(file, filename)),
      measure(() => transformMedium(file, filename)),
      measure(() => transformLarge(file, filename)),
    ]);

    log(
      `<${filename}> s: ${(data[0].size / 1024).toFixed(1)} kB -  m: ${(
        data[1].size / 1024
      ).toFixed(1)} kB - l: ${(data[2].size / 1024).toFixed(1)} kB`
    );

    return {
      s: `${BASE_PATH}/${glryName}/${filename}.s.jpg`,
      m: `${BASE_PATH}/${glryName}/${filename}.m.jpg`,
      l: `${BASE_PATH}/${glryName}/${filename}.l.jpg`,
    };
  });

  const images = await Promise.all(promises);

  const json = { basePath: BASE_PATH, glryName, images };
  writeFileSync(resolve(tmpFolder, 'index.json'), JSON.stringify(json));
};
