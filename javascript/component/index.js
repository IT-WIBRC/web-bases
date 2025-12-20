class CustomInput extends HTMLElement {
  constructor() {
    super();

    // Attribute of the custom element
    this.placeholder = "";
    this.type = "";
    this.isRequired = false;
    this.isReadOnly = false;
  }

  connectedCallback() {
    const shadow = this.attachShadow({ mode: "open" });

    this.label = this.getAttribute("label") ?? "Label"; // To get the value of the attribute passed when using the custom element as a tag
    this.placeholder = this.getAttribute("placeholder") ?? "placeholder";
    this.type = this.getAttribute("type") ?? "text";

    this.isRequired = this.getAttribute("is-required") ?? false;
    this.isReadOnly = this.getAttribute("is-readonly") ?? false;

    const style = document.createElement("style");
    style.textContent = `
        input {
            outline: none;
            padding: 10px;
            width: 400px;
            border-radius: 6px;
            border: none;
            outline: 2px solid rgb(4, 113, 147);
            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
            font-size: 1.1rem;
        }

        input:focus {
            outline: 2px solid cyan;
        }
    `;

    this.appendChild(style);

    const input = document.createElement("input");
    input.placeholder = this.placeholder; // Assign the value got to the native tag element
    input.type = this.type;
    input.name = this.placeholder; // For accessibility, it should always either have a name or id

    console.log(this.isRequired, Boolean(this.isRequired));
    if(this.isRequired === "true")
        input.required = "required";

    if (this.isReadOnly === "true")
        input.readOnly = "readonly";

    shadow.appendChild(style); // Add it's own style
    shadow.appendChild(input);
  }
}

customElements.define("custom-input", CustomInput);
