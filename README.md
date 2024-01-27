# Example netlify nodemailer function

Two versions here currently: 

1. /src/example.js is simplified with no validation and would need to be switched between handling html or json by commenting / uncommenting respective sections 
2. /src/example.ts has validation and can be built with rollup/tsc for optimization 

## Usage

Use either a gmail account with app password or an actual SMTP server

This project structure will work if you want to simply clone this template and edit it. However you don't need to use this project structure, you can set up the netlify function however you want. It will probably be easier to just use the example.js 

The TS version can be used by setting the netlify build command to `npm run build`

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
8. Set form action / fetch `https://domain.netlify.app/.netlify/functions/example`