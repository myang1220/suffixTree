# Suffix Tree Editor
Design a Suffix Tree in an interactable canvas and export to LaTeX code or a PNG file.

# Project Details

Total time: 10 hours <br />
Link to repo: https://github.com/myang1220/suffixTree <br />
Link to GitHub Pages: https://myang1220.github.io/suffixTree/

# Design Choices

- SVGComponent contains most of the logic, including the svg generation and exporting to LaTeX and PNG.
- SVGHook allows the canvas to update and run animations smoothly
- ReactNotification component to display a notification that the LaTeX and PNG file have been successfully copied/downloaded.

# Errors/Bugs
None Known

# How to
- To run locally, fork the project and install necessary dependencies:
  - run `npm install`
  - `npm install react react-dom`
  - `npm install react-notifications-component`
  - `npm install -D typescript`
  - To start in localhost:
    - `npm start`
- To run on the browser, check out the [GitHub Page](https://myang1220.github.io/suffixTree/)
