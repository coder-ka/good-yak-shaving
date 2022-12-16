import React from "react";

function Popup() {
  return (
    <div className="p-4">
      <button
        onClick={() => {
          chrome.tabs.create({
            url: "pages/view.html",
          });
        }}
      >
        View saved items
      </button>
    </div>
  );
}

export default Popup;
