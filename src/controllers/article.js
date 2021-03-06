require("dotenv").config();
const firebaseAdmin = require("../config/firebase");
const {
  CreateArticleModel,
  GetAllArticleModel,
  GetDetailArticleModel,
  DeleteArticleModel,
  UpdateArticleModel,
} = require("../models/article");

exports.CreateArticleController = async (req, res) => {
  try {
    if (!req.body.id_category || !req.body.name || !req.body.description) {
      throw new Error("Your data articles can't be empty");
    }

    if (process.env.APP_ENV === "development") {
      let webPath = req.file.path.replace(/\\/g, "/");

      const dataArticle = {
        id_category: req.body.id_category,
        name: req.body.name,
        description: req.body.description,
        image: webPath,
      };
      const result = await CreateArticleModel(dataArticle);
      // console.log(result);
      res.status(201).send({
        data: {
          id: result[1].insertId,
          msg: `Article with id ${result[1].insertId} succesfully created`,
        },
      });
    } else {
      const nameFileArticle = new Date().getTime();
      const pathFile = `img-articles/${nameFileArticle}.${
        req.file.mimetype.split("/")[1]
      }`;

      const dataArticle = {
        id_category: req.body.id_category,
        name: req.body.name,
        description: req.body.description,
        image: pathFile,
      };
      const result = await CreateArticleModel(dataArticle);
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
        msg: error.message || "Something wrong!",
      },
    });
  }
};

exports.GetAllArticleController = async (req, res) => {
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

    const result = await GetAllArticleModel(params);
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

exports.GetDetailArticleController = async (req, res) => {
  try {
    const result = await GetDetailArticleModel(req.params.id);
    // console.log(result);
    if (result[1][0]) {
      res.status(200).send({
        data: result[1][0],
      });
    } else {
      res.status(404).send({
        error: {
          msg: `Article is not found`,
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

exports.DeleteArticleController = async (req, res) => {
  try {
    const result = await DeleteArticleModel(req.params.id);
    // console.log(result);
    if (result[1].affectedRows) {
      res.status(200).send({
        data: {
          id: req.params.id,
          msg: `Article with id ${req.params.id} succesfully deleted`,
        },
      });
    } else {
      res.status(404).send({
        error: {
          msg: `Article with id ${req.params.id} is not found`,
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

exports.UpdateArticleController = async (req, res) => {
  try {
    if (!Object.keys(req.body).length > 0) {
      throw new Error("Please add data to update");
    }

    const result = await GetDetailArticleModel(req.params.id);

    if (result[1][0]) {
      oldPathImages = result[1][0].image;

      const dataUpdate = {};
      const fillAble = ["id_category", "name", "description"];
      fillAble.forEach((v) => {
        if (req.body[v]) {
          dataUpdate[v] = req.body[v];
        }
      });

      if (process.env.APP_ENV === "development") {
        let webPath = req.file.path.replace(/\\/g, "/");
        const result = await UpdateArticleModel(
          req.params.id,
          dataUpdate,
          webPath
        );
        // console.log(result);
        res.status(200).send({
          data: {
            id: req.params.id,
            msg: `Article with id ${req.params.id} succesfully updated`,
          },
        });
      } else {
        let oldNameImages = oldPathImages.split("/")[1];
        let newImagesOld = oldNameImages.split(".")[0];
        let fileName = req.file.originalname.split(".")[0];

        if (newImagesOld != fileName) {
          const nameFileArticle = new Date().getTime();
          const pathFile = `img-articles/${nameFileArticle}.${
            req.file.mimetype.split("/")[1]
          }`;

          const result = await UpdateArticleModel(
            req.params.id,
            dataUpdate,
            pathFile
          );
          // console.log(result);

          const bucket = firebaseAdmin.storage().bucket();

          //delete previous images
          const deleteImage = bucket.file(oldPathImages);
          await deleteImage.delete();

          //save new image
          const data = bucket.file(pathFile);
          await data.save(req.file.buffer);
          res.status(201).send({
            data: {
              path: `https://firebasestorage.googleapis.com/v0/b/balobe-d2a28.appspot.com/o/${encodeURIComponent(
                pathFile
              )}?alt=media`,
              msg: "Image is uplaoded",
            },
          });
        } else {
          res.status(200).send({
            data: {
              msg: "Data is updated",
            },
          });
        }
      }
    } else {
      res.status(404).send({
        error: {
          msg: `Article with id ${reg.params.id} is not found`,
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
