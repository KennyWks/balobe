require("dotenv").config();
const firebaseAdmin = require("../config/firebase");
const {
  CreatePelapakModel,
  GetAllPelapakModel,
  GetDetailPelapakModel,
  UpdatePelapakModel,
  UpdateLogoModel,
} = require("../models/pelapak");

exports.CreatePelapakController = async (req, res) => {
  try {
    if (
      !req.body.name ||
      !req.body.description ||
      !req.body.city ||
      !req.body.address
    ) {
      throw new Error("Data pelapak can't be empty!");
    }

    const defaultImagePath =
      process.env.APP_ENV === "development"
        ? "uploads/img-logo/default.jpg"
        : "img-logo/default.jpg";
    const queryDataPelapak = await GetDetailPelapakModel(req.auth.id_user);
    if (queryDataPelapak[1][0]) {
      throw new Error("Your account is registered before");
    } else {
      const data = {
        id_owner: req.auth.id_user,
        name: req.body.name,
        logo: defaultImagePath,
        description: req.body.description,
        city: req.body.city,
        address: req.body.address,
      };
      const result = await CreatePelapakModel(data);
      // console.log(result);

      res.status(201).send({
        data: {
          id_pelapak: result[1].insertId,
          msg: "Your store successfully created!",
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        msg: error.message || "Something wrong!",
      },
    });
  }
};

exports.GetDetailPelapakController = async (req, res) => {
  try {
    const result = await GetDetailPelapakModel(req.auth.id_user);
    // console.log(result);
    if (result[1][0]) {
      res.status(200).send({
        data: result[1][0],
      });
    } else {
      res.status(404).send({
        error: {
          msg: "Please register your store",
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        msg: error.message || "Something wrong",
      },
    });
  }
};

exports.UpdatePelapakController = async (req, res) => {
  try {
    if (!Object.keys(req.body).length > 0) {
      throw new Error("Please add data to update");
    }

    const dataUpdate = {};
    const fillAble = ["name", "description", "city", "address"];
    fillAble.forEach((v) => {
      if (req.body[v]) {
        dataUpdate[v] = req.body[v];
      }
    });

    const result = await UpdatePelapakModel(req.auth.id_user, dataUpdate);
    // console.log(result);
    res.status(200).send({
      data: {
        id: req.auth.id_user,
        msg: "Your store is updated",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        msg: error.message || "Something wrong",
      },
    });
  }
};

exports.UpdateLogoContoller = async (req, res) => {
  try {
    if (process.env.APP_ENV === "development") {
      let webPath = req.file.path.replace(/\\/g, "/");
      const result = await UpdateLogoModel(webPath, req.auth.id_user);
      // console.log(result);

      res.status(201).send({
        data: {
          path: webPath,
          msg: "Image is uploaded",
        },
      });
    } else {
      const pathFile = `img-logo/${req.auth.id_user}.${
        req.file.mimetype.split("/")[1]
      }`;
      const result = await UpdateLogoModel(pathFile, req.auth.id_user);
      // console.log(result);

      const bucket = firebaseAdmin.storage().bucket();
      const data = bucket.file(pathFile);
      await data.save(req.file.buffer);
      res.status(201).send({
        data: {
          path: `https://firebasestorage.googleapis.com/v0/b/balobe-d2a28.appspot.com/o/${encodeURIComponent(
            pathFile
          )}?alt=media`,
          msg: "Image is uploaded",
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        msg: error.message || "Something wrong",
      },
    });
  }
};

exports.GetAllPelapakContoller = async (req, res) => {
  try {
    let params = {
      page: req.query.page || 1,
      limit: req.query.limit || 5,
    };

    if (req.query.sort) {
      const sortingValue = req.query.sort.split(".");
      params.sort = {
        key: sortingValue[0],
        value: sortingValue[1] ? sortingValue[1].toUpperCase() : "ASC",
      };
    }

    if (req.query.q) {
      params.search = req.query.q;
    }

    const result = await GetAllPelapakModel(params);
    // console.log(result[1][0]);
    if (result) {
      const totalData = result[1][0].total;
      const totalPages = Math.ceil(result[1][0].total / parseInt(params.limit));
      res.status(200).send({
        data: result[2],
        metadata: {
          pagination: {
            currentPage: params.page,
            totalPage: totalPages,
            nextPage: parseInt(params.page) < totalPages,
            prevPage: parseInt(params.page) > 1,
            limit: parseInt(params.limit),
            total: totalData,
          },
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        msg: error.message || "Something wrong",
      },
    });
  }
};
