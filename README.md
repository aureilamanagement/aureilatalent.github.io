# Aureila Talent website

Static site for GitHub Pages. No build step.

## Before you publish
1. Open `js/config.js`.
2. Create a form at formspree.io and replace YOUR_FORM_ID with your form ID. Both forms (audit and application) use it.
3. Optional: paste a Cal.com or Calendly link into `callLink`. A "Book a free 15 minute call" button then appears after each form is sent.
4. Have your accountant or a solicitor read `privacy.html` and `terms.html` once the business structure is settled. They are sensible drafts, not legal advice.

## Preview locally
Open `index.html` in a browser.

## Publish on GitHub Pages
1. Use a GitHub account that is separate from your personal one, so nothing links the site to your real name.
2. Create a new repository and upload everything in this folder (keep the `CNAME` file).
3. In the repository go to Settings > Pages, choose the main branch and the root folder, and save.
4. Under "Custom domain" enter aureilatalent.com and save. Once the certificate is issued, tick "Enforce HTTPS".

## Point the Namecheap domain
In Namecheap go to Domain List > Manage > Advanced DNS.
1. Delete any parking page or URL redirect records.
2. Add four A records, Host `@`, one each for: 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153
3. Add a CNAME record, Host `www`, Value `YOUR-GITHUB-USERNAME.github.io`
4. Keep nameservers on "Namecheap BasicDNS".
DNS can take from a few minutes to a few hours.
