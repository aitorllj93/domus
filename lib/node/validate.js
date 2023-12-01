const { tableToPrint, toTable } = require("./templates");
const term = require("terminal-kit").terminal;

const validatePorts = (templates) => {
  const table = toTable(templates);

  const publishedPorts = table
    .map((row) => row.ports)
    .flat(Infinity)
    .filter(Boolean);

  const duplicatedPorts = publishedPorts.filter(
    (port, index, ports) => ports.indexOf(port) !== index
  );

  if (duplicatedPorts.length > 0) {
    console.error(
      "Validation Error: There are duplicated ports in the templates:",
      duplicatedPorts
    );

    const rows = table.filter((e) =>
      duplicatedPorts.some((p) => e.ports?.includes(p))
    );

    const headers = Object.keys(rows[0]);

    term.table([headers, ...rows.map((row) => headers.map((h) => row[h]))], {
      hasBorder: true,
      borderChars: "lightRounded",
      borderAttr: { color: "cyan" },
      firstRowTextAttr: { bgColor: "cyan", color: "black" },
      expandToWidth: false,
    });

    process.exit(1);
  }
};

module.exports = {
  validatePorts,
};
