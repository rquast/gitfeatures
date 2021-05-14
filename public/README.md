# GitFeatures
[A browser-based specification editor for Behavior-Driven Development (BDD)](https://gitfeatures.com)

## Aim
To provide teams with a tool and concrete examples that help them intelligently develop software for agile projects.

## Features
- Mindmap-like interface
- Feature toggle management with feature nodes and auto-generated `features-toggles.yml`
- Custom conditions for feature toggles to power toggle flexibility
- Gherkin acceptance criteria editor (for feature files)
- Example maps as a node type - "story", "rule", "example", "question" to help develop acceptance criteria
- Browser-based Git for version control and persistence using [isomorphic-git](https://isomorphic-git.org/)
- PGP commit signing
- Support for document formatting using markdown
- Dynamically generated diagrams using [Mermaid](https://mermaid-js.github.io/)
- Render images and serve files from the browser's local Git repository
- Sketches can be saved in a markdown document

## Launcher Options
The command line launcher runs a Node Express server that contains a CORS proxy and a static file server that serves the bundled GitFeatures on a default port of 25921. When run with no options, it will also automatically open a browser and loads the app.

Running `gitfeatures --help` will display different options for the launcher:

```
Usage: gitfeatures [options]

Example: gitfeatures -c custom.json -t "My Spec" -d "My company: My specification drafting tool" -p 4999 -h "myspec.mycompany.com:4999" 

Options:
    -o true/false: automatically launch browser
    -c JSON configuration filename
    -t title: Page title
    -d description: Meta description
    -p port number: port number to listen on
    -h space separated list of allowed hosts in the Content Security Policy
```

## Tutorials
A selection of video tutorials can be found on the GitFeatures website: [https://gitfeatures.com](https://gitfeatures.com)

## Changing default configuration
GitFeatures stores its initial configuration settings in a `<meta name="gf:config" content="(urlencoded)">` meta tag in index.html. You can provide your own custom configuration by urldecoding the built-in tag content and passing it with the `-c` option on the launcher. This will then urlencode your configuration file and serve it.

## License
MIT License - (c) 2021 Software Engineering & Consulting Pty Ltd
