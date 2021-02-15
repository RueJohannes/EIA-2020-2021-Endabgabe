"use strict";
var Firework;
(function (Firework) {
    window.addEventListener("load", handleLoad);
    // let serverPage: string = "http://localhost:5001";
    let serverPage = "https://eia2-2020-2021.herokuapp.com/";
    // let serverPage: string = "eia2-endabgabe-sh.herokuapp.com/";
    let form;
    let quantity;
    let size;
    let color;
    let duration;
    let luminance;
    let type;
    let moveables = [];
    let canvas;
    let backgroundImage = new Image();
    async function handleLoad(_event) {
        console.log("Moin");
        let response = await fetch(serverPage + "?" + "command=getTitels");
        let listOfTitels = await response.text();
        let titelList = JSON.parse(listOfTitels);
        Firework.generateContent(titelList);
        canvas = document.querySelector("canvas");
        if (!canvas)
            return;
        Firework.crc2 = canvas.getContext("2d");
        let fireworkSaveButton = document.querySelector("button#fireworkSaveButton");
        let fireworkLoadButton = document.querySelector("button#fireworkLoadButton");
        form = document.querySelector("form#userConfiguration");
        canvas.addEventListener("mouseup", createObject);
        fireworkSaveButton.addEventListener("click", sendDataToServer);
        fireworkLoadButton.addEventListener("click", getDataFromServer);
        window.setInterval(update, 20);
        backgroundImage.src = "./images/wsb_logo_bearbeitet.png";
    }
    function createObject(_event) {
        let mousePositionX = _event.clientX - Firework.crc2.canvas.offsetLeft;
        let mousepositionY = _event.clientY - Firework.crc2.canvas.offsetTop;
        let formData = new FormData(document.forms[0]);
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
    async function getDataFromServer(_event) {
        console.log("Datein wurden geladen");
        let target = document.getElementById("LodedTitels");
        let userValue = target.value;
        let response = await fetch(serverPage + "?" + "command=getAllDatas");
        let responseContent = await response.text();
        let allDatas = JSON.parse(responseContent);
        let result = allDatas.find(item => item.fireworkName === userValue);
        console.log(result);
        createUserRocket(result);
    }
    Firework.getDataFromServer = getDataFromServer;
    function createUserRocket(_result) {
        let color = _result?.particleColor;
        let duration = _result?.duration;
        let type = _result?.shape;
        console.log(color, duration, type);
        let form = document.getElementsByTagName("form");
        for (let i = 0; i < form[0].elements.length; i++) {
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
                let particleColor = document.getElementById("particleColor");
                particleColor.value = color;
            }
            // if (form[0].elements[i].id == "luminance") {
            //   let luminance: HTMLInputElement = <HTMLInputElement>document.getElementById("luminance");
            //   luminance.value = <string>color;
            // }
        }
    }
    async function sendDataToServer(_event) {
        let userConfigurationData = new FormData(form);
        let fireworkSave = document.querySelector("input#fireworkSave");
        let fireworkName;
        fireworkName = fireworkSave.value;
        let query = new URLSearchParams(userConfigurationData);
        console.log(fireworkName);
        // query.append("fireworkName", fireworkName);
        let response = await fetch(serverPage + "?" + query.toString());
        let responseText = await response.text();
        alert("Deine Daten wurden gespeichert");
        console.log("Daten geschickt: ", responseText);
        fireworkSave.value = "";
    }
    function createParticle(_quantity, _size, _mousePositionX, _mousePositionY, _color, _luminance, _duration, _type) {
        let origin = new Firework.Vector(_mousePositionX, _mousePositionY);
        let color = _color;
        let radian = (Math.PI * 2) / _quantity;
        for (let i = 0; i < _quantity; i++) {
            let px;
            let py;
            let velocity;
            let particle;
            if (i % 2 == 0) {
                px = Math.cos(radian * i) * 150 + Math.random() * 20;
                py = Math.sin(radian * i) * 150 + Math.random() * 20;
            }
            else {
                px = Math.cos(radian * i) * 110 * Math.random() * 2;
                py = Math.sin(radian * i) * 110 * Math.random() * 2;
            }
            velocity = new Firework.Vector(px, py);
            particle = new Firework.Particle(size, origin, velocity, color, luminance, duration, type);
            moveables.push(particle);
        }
    }
    function update() {
        Firework.crc2.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
        for (let moveable of moveables) {
            moveable.move(1 / 50);
            moveable.draw();
        }
        deleteExpandables();
    }
    function deleteExpandables() {
        for (let index = 0; index <= moveables.length - 1; index++) {
            if (moveables[index].expendable)
                moveables.splice(index, 1);
        }
    }
})(Firework || (Firework = {}));
//# sourceMappingURL=Main.js.map