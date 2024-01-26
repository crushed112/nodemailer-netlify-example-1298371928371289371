# Example netlify nodemailer function

Set up for HTML only, but JS version is commented out

Use either a gmail account with app password or an actual SMTP server

## Usage

This project structure will work if you want to simply clone this template and edit it. However you don't need to use this project structure, you can set up the netlify function however you want. It will probably be easier to just use the example.js 

The TS version might be useful, but running terser etc is really not neccessary, but can be done by setting the netlify build command to `npm run build`

[example.js](/src/example.js)
[example.ts](/src/example.ts)

## Creating App Password

[Create Gmail App Password](https://security.google.com/settings/security/apppasswords)

## Deploy to netlify

1. Clone this repo
2. "Add new site"
3. "Import an existing project"
4. "Deploy with GitHub / GitLab"
5. No Presets Needed ( set build command if using ts version)
6. Add Environmental Variables
7. Deploy and view logs at Logs in Left Sidear then Functions then Select example