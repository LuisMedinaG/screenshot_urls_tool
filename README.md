Screenshot Validator
====================

A Node.js tool that uses Puppeteer to take screenshots of URLs listed in a configuration file. It connects to an open Chrome instance, navigates each URL, takes a screenshot, and saves it for validation.

Requirements
------------

-   **Node.js** (v14 or higher recommended)
-   **Google Chrome** 

Installation
------------

1.  **Clone the repository**:

    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

4.  **Create `config.json`** Add a `config.json` file in the root directory, with a structure like the following:

    ```json
    {
      "urls": [
        "https://example.com/",
        "https://anotherexample.com/"
      ]
    }
    ```

Usage
-----

### 1\. Start Chrome in Debug Mode

Before running the application, start Chrome with remote debug mode enabled on port `9222`:

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')
```

### 2\. Run the Application

```bash
node index.js
```

### 3\. View Results

View Results Screenshots are saved in the `screenshots` folder.

**Example Output:**

```bash
✅ https://example.com/ - Screenshot saved: /path/to/screenshots/example_com.png
❌ https://anotherexample.com/ - Error: Network timeout
```

Configuration
-------------

-   **Viewport**: Set to 1920x1080 for high-quality screenshots.

License
-------

This project is licensed under the MIT License.
