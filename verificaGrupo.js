function verificaGrupo(msg) {
  let grupo = "";

  if ((msg._data.from == "56972359367-1626622694@g.us" || msg._data.from == "120363027127365401@g.us") && msg.type == "chat") {
    // console.log("aqui", aqui);
    // console.log(msg._data.body);
    const str = msg._data.body;
    // console.log("str", str);

    // Verificar si contiene un número mayor a 9 dígitos
    const numeroMayor9Digitos = /\d{9,}/.test(str);
    // console.log("numero", numeroMayor9Digitos);

    // Verificar si contiene las palabras "asignar" o "op" (ignorando mayúsculas y minúsculas)
    const contieneAsignarOp = /(?:asignar|op)/i.test(str);
    // console.log("contieneAsignarOp", contieneAsignarOp);

    if (numeroMayor9Digitos || contieneAsignarOp) {
      grupo = "op";
    }
  } else if ((msg._data.from == "56972359367-1626627314@g.us" || msg._data.from == "120363027127365401@g.us") && msg.type == "location") {
    grupo = "ubicacion";
  }
  return grupo;
}

module.exports = verificaGrupo;
