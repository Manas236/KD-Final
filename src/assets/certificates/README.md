# Certificate images (watermarked copies only)

This folder holds the images behind the "View certificate" buttons on
`/hse` (Certifications), one per certificate, under a fixed name:

| File | Card |
| --- | --- |
| `iso-45001.jpg` | ISO 45001:2018 |
| `iso-14001.jpg` | ISO 14001:2015 |
| `iso-9001.jpg` | ISO 9001:2015 |
| `pwd-licence.jpg` | PWD electrical licence |
| `tax-recognition.jpg` | Recognition by Indian Tax Authorities |
| `cidco-registration.jpg` | Registered with CIDCO |

Nothing is put here by hand. `npm run certificates:build`
(`scripts/build-certificates.mjs`) reads the scans K.D. supplies, from
`ISO_Certificates/`, `Tax_Certificate/`, `CIDCO_Certificate/` and
`PWD_Licence/` in the project root or its parent folder, and writes each
here scaled to 1400px and watermarked ("K.D. Constructions · For
verification only"). The scans are git-ignored and never served. A card
whose image is missing shows no button. See the script's header and
OPEN-QUESTIONS.md #58.
