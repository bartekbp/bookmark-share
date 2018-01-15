import escape from "lodash/escape";

const pathRenderer = path =>
  path
    .map(segment => `<span class="shares-segment">${escape(segment)}</span>`)
    .join("<span class='shares-separator'>&gt;</span>");

export default ctx =>
  ` <div class="mdc-list-item__text">
      <span class="shares-path">${pathRenderer(ctx.path)}</span>
      <span>
        <i class="material-icons">vpn_key</i>
        <span class="shares-element-uuid mdc-list-item__secondary-text">${
          ctx.key
        }</span>
      </span>
    </div>
    <div class="mdc-list-item__meta">
      <i class="shares-remove-button button material-icons" data-chromeId="${
        ctx.chromeId
      }" title="Delete">delete</i>
      <i data-chromeId="${
        ctx.chromeId
      }" class="shares-push-button button material-icons" style="display: ${
    ctx.shouldPush ? "block" : "none"
  };" title="Push your changes">publish</i>
      <i data-chromeId="${
        ctx.chromeId
      }" class="shares-sync-button button material-icons" title="Sync">sync</i>
    </div>`;
