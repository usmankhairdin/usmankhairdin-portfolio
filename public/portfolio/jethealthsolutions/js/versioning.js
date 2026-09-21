$(document).ready(function () {
  // Base version format
  const baseVersion = "1.0.0";

  // Function to calculate a new version based on a hash of the file content
  function getVersionFromContent(base, content) {
    // Create a hash of the content
    const hash = Array.from(content)
      .reduce((hash, char) => (hash + char.charCodeAt(0)) % 1000, 0); // Modulo keeps version short
    const versionParts = base.split(".");
    versionParts[2] = hash; // Use hash as the patch version
    return versionParts.join(".");
  }

  // Function to update file versions dynamically
  function updateFileVersion(url, selector, attr, baseVersion) {
    $.ajax({
      url: url,
      type: "GET",
      cache: false, // Ensure we're getting the latest file
      success: function (content) {
        const newVersion = getVersionFromContent(baseVersion, content);

        // Current attribute URL
        const currentAttr = $(selector).attr(attr);
        const currentVersionMatch = currentAttr.match(/\?v=(.*)/);
        const currentVersion = currentVersionMatch ? currentVersionMatch[1] : null;

        // Update the file version only if it has changed
        if (currentVersion !== newVersion) {
          const updatedUrl = `${url}?v=${newVersion}`;
          $(selector).attr(attr, updatedUrl);
          console.log(`Updated ${url} to ${updatedUrl}`);
        } else {
          console.log(`No changes detected for ${url}. Version remains the same.`);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error(`Error retrieving ${url}: ${textStatus}, ${errorThrown}`);
      },
    });
  }

  // Files to apply versioning
  const filesToVersion = [
    { url: "css/style.css", selector: "link[href='css/style.css']", attr: "href" },
    { url: "css/responsive.css", selector: "link[href='css/responsive.css']", attr: "href" },
    { url: "css/all.min.css", selector: "link[href='css/all.min.css']", attr: "href" },
    { url: "js/utility.js", selector: "script[src='js/utility.js']", attr: "src" },
    { url: "js/viewportchecker.js", selector: "script[src='js/viewportchecker.js']", attr: "src" },
    { url: "js/main.js", selector: "script[src='js/main.js']", attr: "src" },
  ];

  // Iterate over all files and apply versioning
  filesToVersion.forEach((file) => {
    updateFileVersion(file.url, file.selector, file.attr, baseVersion);
  });
});