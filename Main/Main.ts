namespace Firework {
  window.addEventListener("load", handleLoad);
  // let serverPage: string = "http://localhost:5001";
  let serverPage: string = "https://eia2-2020-2021.herokuapp.com/";
  let form: HTMLFormElement;
  let quantity: number;
  let size: number;
  let color: string;
  let duration: number;
  let luminance: string;
  let type: string;
  let moveables: MoveableObject[] = [];
  let canvas: HTMLCanvasElement;
  let backgroundImage: HTMLImageElement = new Image();
  export let crc2: CanvasRenderingContext2D;

  async function handleLoad(_event: Event): Promise<void> {
    console.log("BUY BITCOIN");
    let response: Response = await fetch(serverPage + "?" + "command=getTitels");
    let listOfTitels: string = await response.text();
    let titelList: Rocket[] = JSON.parse(listOfTitels);

    generateContent(titelList);
    canvas = <HTMLCanvasElement>document.querySelector("canvas");
    if (!canvas)
      return;
    crc2 = <CanvasRenderingContext2D>canvas.getContext("2d");
    let fireworkSaveButton: HTMLButtonElement = <HTMLButtonElement>document.querySelector("button#fireworkSaveButton");
    let fireworkLoadButton: HTMLButtonElement = <HTMLButtonElement>document.querySelector("button#fireworkLoadButton");
    form = <HTMLFormElement>document.querySelector("form#userConfiguration");
    canvas.addEventListener("mouseup", createObject);
    fireworkSaveButton.addEventListener("click", sendDataToServer);
    fireworkLoadButton.addEventListener("click", getDataFromServer);
    window.setInterval(update, 20);

    backgroundImage.src = "./images/wsb_logo_bearbeitet.png";
  }

  function createObject(_event: MouseEvent): void {
    let mousePositionX: number = _event.clientX - crc2.canvas.offsetLeft;
    let mousepositionY: number = _event.clientY - crc2.canvas.offsetTop;
    let formData: FormData = new FormData(document.forms[0]);

    for (let entry of formData) {
      quantity = Number(formData.get("quantity"));
      size = Number(formData.get("size"));
      duration = Number(formData.get("duration"));
      color = String(formData.get("particleColor"));
      luminance = String(formData.get("luminance"));
      switch (entry[1]) {
        case "circle":
          type = "circle";
          break;
        case "triangle":
          type = "triangle";
          break;
        case "square":
          type = "square";
          break;
        case "gme":
          type = "gme";
          break;
      }
    }
    createParticle(quantity, size, mousePositionX, mousepositionY, color, luminance, duration, type);
    console.log(type);
  }

  export async function getDataFromServer(_event: Event): Promise<void> {
    console.log("Datein wurden geladen");
    let target: HTMLInputElement = <HTMLInputElement>document.getElementById("LodedTitels");
    let userValue: string = target.value;
    let response: Response = await fetch(serverPage + "?" + "command=getAllDatas");
    let responseContent: string = await response.text();
    let allDatas: Rocket[] = JSON.parse(responseContent);
    let result: Rocket | undefined = allDatas.find(item => item.fireworkName === userValue);
    console.log(result);
    createUserRocket(result);
  }

  function createUserRocket(_result: Rocket | undefined): void {
    let color: string | undefined = _result?.particleColor;
    let duration: number | undefined = _result?.duration;
    let type: string | undefined = _result?.shape;
    console.log(color, duration, type);

    let form: HTMLCollectionOf<HTMLFormElement> = document.getElementsByTagName("form");

    for (let i: number = 0; i < form[0].elements.length; i++) {
      // if (form[0].elements[i].id == "quantity") {
      //   let quantity: HTMLInputElement = <HTMLInputElement>document.getElementById("quantity");
      //   quantity.value = <string>color;
      // }
      // if (form[0].elements[i].id == "size") {
      //   let size: HTMLInputElement = <HTMLInputElement>document.getElementById("size");
      //   size.value = <string>color;
      // }
      // if (form[0].elements[i].id == "duration") {
      //   let duration: HTMLInputElement = <HTMLInputElement>document.getElementById("duration");
      //   duration.value = <string>color;
      // }
      // if (form[0].elements[i].id == "shape") {
      //   let shape: HTMLInputElement = <HTMLInputElement>document.getElementById("shape");
      //   shape.value = <string>color;
      // }
      if (form[0].elements[i].id == "particleColor") {
        let particleColor: HTMLInputElement = <HTMLInputElement>document.getElementById("particleColor");
        particleColor.value = <string>color;
      }
      // if (form[0].elements[i].id == "luminance") {
      //   let luminance: HTMLInputElement = <HTMLInputElement>document.getElementById("luminance");
      //   luminance.value = <string>color;
      // }
    }
  }

  async function sendDataToServer(_event: Event): Promise<void> {
    let userConfigurationData: FormData = new FormData(form);
    let fireworkSave: HTMLInputElement = <HTMLInputElement>document.querySelector("input#fireworkSave");
    let fireworkName: string = fireworkSave.value;
    let query: URLSearchParams = new URLSearchParams(<any>userConfigurationData);
    console.log(fireworkName);
    // query.append("fireworkName", fireworkName);
    let response: Response = await fetch(serverPage + "?" + query.toString());
    let responseText: string = await response.text();
    alert("Deine Daten wurden gespeichert");
    console.log("Daten geschickt: ", responseText);
    fireworkSave.value = "";
  }

  function createParticle(_quantity: number, _size: number, _mousePositionX: number, _mousePositionY: number, _color: string, _luminance: string, _duration: number, _type: string): void {
    let origin: Vector = new Vector(_mousePositionX, _mousePositionY);
    let color: string = _color;
    let radian: number = (Math.PI * 2) / _quantity;
    for (let i: number = 0; i < _quantity; i++) {
      let px: number;
      let py: number;
      let velocity: Vector;
      let particle: MoveableObject;
      if (i % 2 == 0) {
        px = Math.cos(radian * i) * 150 + Math.random() * 20;
        py = Math.sin(radian * i) * 150 + Math.random() * 20;
      }
      else {
        px = Math.cos(radian * i) * 110 * Math.random() * 2;
        py = Math.sin(radian * i) * 110 * Math.random() * 2;
      }
      velocity = new Vector(px, py);
      particle = new Particle(size, origin, velocity, color, luminance, duration, type);
      moveables.push(particle);
    }
  }


  function update(): void {
    crc2.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    for (let moveable of moveables) {
      moveable.move(1 / 50);
      moveable.draw();
    }
    deleteExpandables();
  }

  function deleteExpandables(): void {
    for (let index: number = 0; index <= moveables.length - 1; index++) {
      if (moveables[index].expendable)
        moveables.splice(index, 1);
    }
  }
}