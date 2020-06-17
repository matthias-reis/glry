const { couchRefined, couchSetNamespace } = require('../lib');
const { googleCreateAlbum, googleAddToAlbum } = require('../lib');
const { logger } = require('just-task');
const { bold, green, red, yellow } = require('chalk');
const { writeFileSync } = require('fs');
const { join } = require('path');

module.exports = async name => {
  couchSetNamespace(name);
  let md = '';

  const list = await couchRefined().list();

  list.rows
    .sort((a, b) => (a.id < b.id ? -1 : 1))
    .forEach(row => {
      const album = row.doc;
      md += `\n## ${album.name}\n`;

      if (album.lostPhotos) {
        md += `\n❌ Verlorene Fotos: __${album.lostPhotos.length}__\n`;
      }

      if (album.assignedPhotos) {
        md += `✅ Aufgefundene Fotos: __${album.assignedPhotos.length}__\n\n`;
        album.assignedPhotos.forEach(photo => {
          md += `- 🖼 [${photo.doc.filename}](${photo.doc.productUrl})\n`;
        });
      }
    });

  writeFileSync(join(__dirname, 'photos.md'), md);

  logger.info(`added all albums to documentation file`);
};
