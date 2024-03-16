# QuickTypoFix

![demo](https://github.com/hmasdev/QuickTypoFix/blob/main/images/demo.gif)

A versatile VSCode extension designed to instantly correct typos across all text files,
streamlining your coding workflow with seamless LLM-powered typo correction.

You can use [OpenAI chat completion API](https://platform.openai.com/docs/guides/text-generation/chat-completions-api) and also OpenAI compatible chat completion API like [groq](https://wow.groq.com/).

## Features

- Quickly fix typos in your line.
- Highlights the fixed typos for a short period of time.

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/)
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/get-npm)
  - Dependencies:
    - [vsce](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
    - [diff](https://www.npmjs.com/package/diff)
    - [node-fetch](https://www.npmjs.com/package/node-fetch)
- [OpenAI API Key](https://platform.openai.com/api-keys)

## Installation

You can install this extension in two ways:

### Download `.vsix` file

1. Download the `.vsix` file from [https://github.com/hmasdev/QuickTypoFix/releases](https://github.com/hmasdev/QuickTypoFix/releases)

2. Install the extension with `install from VSIX...` in VS Code.

    ![Install the extension](https://github.com/hmasdev/QuickTypoFix/blob/main/images/install-extension.png)

### Build from Source

1. Clone the repository:

    ```sh
    git clone https://github.com/hmasdev/QuickTypoFix
    ```

2. Change to the directory:

    ```sh
    cd QuickTypoFix
    ```

3. Install the dependencies:

    ```sh
    npm install
    ```

4. Build the extension:

    ```sh
    vsce package
    ```

5. Install the extension with `install from VSIX...` in VS Code in the same way as the [above](#download-vsix-file).

## Usage

### Preparation(Configuration)

Open the setting page with `Ctrl+,` and search `quicktypofix`.
Then you can customize this extension as follows:

- **REQUIRED**
  - `quicktypofix.apiKey`: The API key for typo corrections. Default is an empty string;
- **Optional**
  - `quicktypofix.apiEndpoint`: The OpenAI-compatible chat completion API endpoint for typo corrections. Default is [https://api.openai.com/v1/chat/completions](https://api.openai.com/v1/chat/completions);
  - `quicktypofix.modelName`: The LLM model name for typo corrections. Default is `gpt-3.5-turbo`;
  - `quicktypofix.systemPrompt`: The system prompt for typo corrections. Default is 'Excellent Typo Fixer. Output the only fixed sentence without any header or any footer.';
  - `quicktypofix.highlightTimeout`: The timeout for the highlight in milliseconds. Default is 3000;
  - `quicktypofix.highlightColor`: The color for the highlight like `rgba(255, 255, 0, 0.5)` or `#FFFF00`. Default is `rgba(255, 255, 0, 0.5)`.

### Use this Extension

During writing codes or texts in VS Code, you can use the QuickTypoFix command to fix typos in the following two ways.

1. `Ctrl+Shift+P` to open the command palette, then type `Fix typo in this line` and select the command.

or

2. `Crtl+K Ctrl+N` to execute the command directly.

   - NOTE: You can remeber the shortcut by `Ctrl+K` followed by `Ctrl+N` as "これ直して（Kore Naoshite）".

After fixed, the typo will be highlighted for a short period of time. Check them.

## Development

1. Fork the repository: [https://github.com/hmasdev/QuickTypoFix/fork](https://github.com/hmasdev/QuickTypoFix/fork)

2. Clone the forked repository:

    ```sh
    git clone https://github.com/{YOUR_ACCOUT_HERE}/QuickTypoFix
    ```

3. Change to the directory:

    ```sh
    cd QuickTypoFix
    ```

4. Git checkout to the branch for development:

    ```sh
    git checkout -b {YOUR_BRANCH_NAME_HERE}
    ```

5. Install the dependencies:

    ```sh
    npm install
    ```

6. Edit the source code. Some notes as follows:

   - Implement tests as follows:
     - Unit Test: attach 'Unit Test' to the title in `describe`
     - Integration Test: attach 'Integration Test' to the title in `describe`
       - Note that "Integration Test" means the tests which require an external services like the OpenAI API.

7. Test the extension:

   - Unit Test

     ```sh
     npm run test
     ```

   - Integration Test

     ```sh
     npm run test-integration
     ```

     Note that you need to add your OpenAI API key to the `.env` file before running integration tests. The `.env` file should be like this:

     ```sh
     OPENAI_API_KEY={YOUR_OPENAI_API_KEY}
     ```

8. Git commit and push the changes:

    ```sh
    git add .
    git commit -m "Add xxxx feature"
    git push origin add_xxxx_feature
    ```

9. Create a pull request from the following link: `https://github.com/hmasdev/QuickTypoFix/compare/master...{YOUR_ACCOUT_HERE}:QuickTypoFix:{YOUR_BRANCH_NAME_HERE}`

### Release

Release the extension is automated by GitHub Actions. The following steps are for the maintainers:

```sh
npm version {HERE_IS_THE_VERSION}
git push origin {HERE_IS_THE_VERSION}
```

where the tag format must be `%d.%d.%d` like `0.0.1`.

After that, the maintainers should check the release page: [https://github.com/hmasdev/QuickTypoFix/releases](https://github.com/hmasdev/QuickTypoFix/releases)

## TODO

- [] Specify the versions of requirements
- [] Implement the customizable dictionaries
- [] Add the tests for ./temporalHighlight.js

## License

- [MIT](https://github.com/hmasdev/QuickTypoFix/blob/main/LICENSE)

## Author

- [hmasdev](https://github.com/hmasdev)
