import { api } from "src/boot/axios";

function getCodeOpt(codeGrpId) {
  return api
    .post("/comCodeJs/getOpt", codeGrpId)
    .then((res) => {
      return res.data.data;
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
}

export { getCodeOpt };
