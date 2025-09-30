// Detects whether table <td> children can grow vertically (Firefox bug workaround)
export function getCanVGrowWithinCell(): boolean {
  if (typeof document === "undefined") return true; // SSR safety

  let table = document.createElement("table");
  table.style.height = "100px";

  let tbody = document.createElement("tbody");
  table.appendChild(tbody);

  let tr = document.createElement("tr");
  tbody.appendChild(tr);

  let td = document.createElement("td");
  tr.appendChild(td);

  let div = document.createElement("div");
  div.style.height = "100%";
  td.appendChild(div);

  document.body.appendChild(table);
  let canGrow = div.offsetHeight >= 100;
  document.body.removeChild(table);

  return canGrow;
}
