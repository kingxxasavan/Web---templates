'use strict';

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const config = require('../config');

function templateDir(slug) {
  // Guard against traversal: slugs come from the URL, so resolve and confirm
  // the result is still inside the templates directory.
  const base = path.resolve(config.templatesDir);
  const dir = path.resolve(base, slug);
  if (dir !== base && !dir.startsWith(base + path.sep)) {
    throw new Error('Invalid template slug');
  }
  return dir;
}

function exists(slug) {
  try {
    return fs.statSync(templateDir(slug)).isDirectory();
  } catch {
    return false;
  }
}

/** The licence text that ships inside every download. */
function licenceText({ template, buyerEmail, orderReference }) {
  return `${config.store.name} — Template Licence
========================================

Template:  ${template.name} (${template.slug})
Licensed to: ${buyerEmail}
Order:     ${orderReference}
Issued:    ${new Date().toISOString().slice(0, 10)}

WHAT YOU MAY DO
  - Use this template for one website, personal or commercial.
  - Modify it however you like, including removing all attribution.
  - Hand the modified site to a client as part of paid work.

WHAT YOU MAY NOT DO
  - Resell or redistribute the template itself, modified or not.
  - Include it in another template, theme or template bundle.

This licence does not expire. Re-download any time from your account.
Questions: ${config.store.supportEmail}
`;
}

/**
 * Stream a template directory to the response as a zip, adding a per-buyer
 * LICENCE.txt and, for each purchased add-on, its documentation.
 */
function streamZip(res, { template, buyerEmail, orderReference, addons = [] }) {
  const dir = templateDir(template.slug);
  if (!exists(template.slug)) {
    throw new Error(`Template source missing for ${template.slug}`);
  }

  const archive = archiver('zip', { zlib: { level: 9 } });
  const filename = `${template.slug}-${config.store.name.replace(/\W+/g, '')}.zip`;

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  archive.pipe(res);

  archive.directory(dir, template.slug);
  archive.append(licenceText({ template, buyerEmail, orderReference }), {
    name: `${template.slug}/LICENCE.txt`,
  });

  for (const addonId of addons) {
    const addon = config.store.addons[addonId];
    if (!addon) continue;
    const addonDir = path.join(config.templatesDir, '_addons', addonId);
    if (fs.existsSync(addonDir)) {
      archive.directory(addonDir, `${template.slug}/addons/${addonId}`);
    } else {
      archive.append(`${addon.name}\n\n${addon.blurb}\n`, {
        name: `${template.slug}/addons/${addonId}/README.txt`,
      });
    }
  }

  archive.finalize();
  return archive;
}

module.exports = { streamZip, exists, templateDir, licenceText };
