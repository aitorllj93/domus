const { printTable, tableToPrint, toTable } = require("./templates");

const validatePorts = (templates) => {
  const table = toTable(templates);

  const publishedPorts = table.map((row) => row.ports).flat(Infinity);

  const duplicatedPorts = publishedPorts.filter(
    (port, index, ports) => ports.indexOf(port) !== index
  );

  if (duplicatedPorts.length > 0) {
    console.error(
      "Validation Error: There are duplicated ports in the templates:",
      duplicatedPorts
    );
    // printTable(templates.filter(t => ));
    console.table(
      tableToPrint(
        table.filter((e) => duplicatedPorts.some((p) => e.ports.includes(p)))
      )
    );
    process.exit(1);
  }
};

module.exports = {
  validatePorts,
};
