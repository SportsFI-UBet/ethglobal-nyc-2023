import "wagmi/window";

const writeText = (text: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    let success = false;
    const listener = (e: ClipboardEvent) => {
      e.clipboardData?.setData("text/plain", text);
      e.preventDefault();
      success = true;
    };
    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
    success ? resolve() : reject();
  });
};

// If using metamask on android, fix clipboard
if (
  /android/i.test(navigator.userAgent ?? "") &&
  window?.ethereum?.isMetaMask
) {
  window.navigator.clipboard.writeText = writeText;
}

export {};
