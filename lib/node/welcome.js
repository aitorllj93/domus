const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const welcomeMessage = async () => {
  console.log(`
██████╗  ██████╗ ███╗   ███╗██╗   ██╗███████╗
██╔══██╗██╔═══██╗████╗ ████║██║   ██║██╔════╝
██║  ██║██║   ██║██╔████╔██║██║   ██║███████╗
██║  ██║██║   ██║██║╚██╔╝██║██║   ██║╚════██║
██████╔╝╚██████╔╝██║ ╚═╝ ██║╚██████╔╝███████║
╚═════╝  ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚══════╝                                     
  `);

  console.log(
    "                                   /\\\r\n                              /\\  //\\\\\r\n                       /\\    //\\\\///\\\\\\        /\\\r\n                      //\\\\  ///\\////\\\\\\\\  /\\  //\\\\\r\n         /\\          /  ^ \\/^ ^/^  ^  ^ \\/^ \\/  ^ \\\r\n        / ^\\    /\\  / ^   /  ^/ ^ ^ ^   ^\\ ^/  ^^  \\\r\n       /^   \\  / ^\\/ ^ ^   ^ / ^  ^    ^  \\/ ^   ^  \\       *\r\n      /  ^ ^ \\/^  ^\\ ^ ^ ^   ^  ^   ^   ____  ^   ^  \\     /|\\\r\n     / ^ ^  ^ \\ ^  _\\___________________|  |_____^ ^  \\   /||o\\\r\n    / ^^  ^ ^ ^\\  /______________________________\\ ^ ^ \\ /|o|||\\\r\n   /  ^  ^^ ^ ^  /________________________________\\  ^  /|||||o|\\\r\n  /^ ^  ^ ^^  ^    ||___|___||||||||||||___|__|||      /||o||||||\\\r\n / ^   ^   ^    ^  ||___|___||||||||||||___|__|||          | |\r\n/ ^ ^ ^  ^  ^  ^   ||||||||||||||||||||||||||||||oooooooooo| |ooooooo\r\nooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooo"
  );

  console.log(
    "\nWelcome to the Domus Installer. This tool will help you install your Domus server.\n"
  );

  await delay(500);
};

module.exports = {
  welcomeMessage,
};
