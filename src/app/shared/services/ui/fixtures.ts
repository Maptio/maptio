export class Fixtures {
    public WITH_SVG =
    `
    <html>
    <head></head>
    <body>
        <svg>
            <circle>Some circles</circle>
        </svg>
    </body>
    </html>
    `

    public WITH_MANY_SVG =
    `
    <html>
    <head></head>
    <body>
        <svg>
            <circle>Some circles</circle>
        </svg>
        <svg>
            <path>Some paths</path>
        </svg>
         <svg>
            <line>Some lines</line>
        </svg>
    </body>
    </html>
    `

    public WITHOUT_SVG =
    `
    <html>
    <head></head>
    <body>
    </body>
    </html>
    `
}