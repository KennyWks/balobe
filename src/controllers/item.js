const firebaseAdmin = require("../config/firebase");
const fs = require("fs");
const {
  CreateItemModel,
  GetAllItemModel,
  GetAllItemPelapakModel,
  GetDetailItemModel,
  UpdateItemModel,
  DeleteItemModel,
  GetDataItem,
  UpdateImageItemModel,
  CreateReviewItemModel,
  UpdateReviewItemModel,
  GetReviewByUserModel,
  GetReviewByIdModel,
  GetAllReviewModel,
  GetReviewByIdItemModel,
} = require("../models/item");

// controller for controller items
exports.CreateItemController = async (req, res) => {
  try {
    if (
      !req.body.id_pelapak ||
      !req.body.id_category ||
      !req.body.name ||
      !req.body.price ||
      !req.body.quantity ||
      !req.body.weight ||
      !req.body.description
    ) {
      throw new Error("data can't be empty");
    }
    if (process.env.APP_ENV === "development") {
      let webPath = req.file.path.replace(/\\/g, "/");
      const dataItems = {
        id_pelapak: req.body.id_pelapak,
        id_category: req.body.id_category,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        weight: req.body.weight,
        description: req.body.description,
        image: webPath,
      };

      const result = await CreateItemModel(dataItems);
      // console.log(result);

      if (result) {
        res.status(201).send({
          data: {
            id: result[1].insertId,
            msg: "Item is created",
          },
        });
      }
    } else {
      const nameFileItem = new Date().getTime();
      const pathFile = `img-items/${nameFileItem}.${
        req.file.mimetype.split("/")[1]
      }`;

      const dataItems = {
        id_pelapak: req.body.id_pelapak,
        id_category: req.body.id_category,
        name: req.body.name,
        price: req.body.price,
        quantity: req.body.quantity,
        weight: req.body.weight,
        description: req.body.description,
        image: pathFile,
      };

      const result = await CreateItemModel(dataItems);
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

exports.GetAllItemController = async (req, res) => {
  try {
    let params = {
      page: req.query.page || 1,
      limit: req.query.limit || 8,
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

    const result = await GetAllItemModel(params);
    // console.log(result);
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

exports.GetAllItemPelapakController = async (req, res) => {
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
        console.log(params);


    const result = await GetAllItemPelapakModel(params, req.params.id);
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

exports.GetDetailItemController = async (req, res) => {
  try {
    const result = await GetDetailItemModel(req.params.id);
    // console.log(result);
    if (result[1][0]) {
      res.status(200).send({
        data: result[1][0],
      });
    } else {
      res.status(404).send({
        error: {
          msg: "Item is not found",
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

exports.UpdateItemContoller = async (req, res) => {
  try {
    if (!Object.keys(req.body).length > 0) {
      throw new Error("Please add data to update");
    }

    const dataUpdate = {};
    const fillAble = [
      "id_category",
      "name",
      "price",
      "quantity",
      "weight",
      "description",
    ];

    fillAble.forEach((v) => {
      if (req.body[v]) {
        dataUpdate[v] = req.body[v];
      }
    });

    const result = await UpdateItemModel(req.params.id, dataUpdate);
    // console.log(result);
    res.status(200).send({
      data: {
        id: req.params.id,
        msg: "Items is updated",
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

exports.DeleteItemController = async (req, res) => {
  try {
    const result = await DeleteItemModel(req.params.id);
    // console.log(result);
    if (result[1].affectedRows) {
      res.status(200).send({
        data: {
          id: req.params.id,
          msg: `Item is sucessfully deleted`,
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

exports.UpdateItemImageContoller = async (req, res) => {
  try {
    const resultGetData = await GetDataItem(req.params.id_item);
    if (resultGetData[1][0]) {
      oldImages = resultGetData[1][0].image;
      if (process.env.APP_ENV === "development") {
        let webPath = req.file.path.replace(/\\/g, "/");
        if (oldImages !== webPath) {
          let deleteImage = "./" + oldImages;
          fs.unlink(deleteImage, function (err) {
            if (err && err.code == "ENOENT") {
              // file doens't exist
              console.info("File doesn't exist, won't remove it.");
            } else if (err) {
              // other errors, e.g. maybe we don't have enough permission
              console.error("Error occurred while trying to remove file");
            } else {
              console.info(`removed`);
            }
          });
        }

        await UpdateImageItemModel(webPath, req.params.id_item);

        res.status(201).send({
          data: {
            id_item: req.params.id_item,
            path: webPath,
            msg: "Image is uploaded",
          },
        });
      } else {
        const nameFileItem = new Date().getTime();
        const pathFile = `img-items/${nameFileItem}.${
          req.file.mimetype.split("/")[1]
        }`;

        await UpdateImageItemModel(pathFile, req.params.id_item);
        const bucket = firebaseAdmin.storage().bucket();

        //delete previous images
        const deleteImage = bucket.file(oldImages);
        await deleteImage.delete();

        //save new images
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
    } else {
      res.status(404).send({
        error: {
          msg: "Item not found",
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
//end line code for controller items

//controller for items review
exports.CreateReviewController = async (req, res) => {
  try {
    if (!req.body.rating || !req.body.review) {
      throw new Error("data rating or review can't be empty");
    }

    const data = {
      id_user: req.auth.id_user,
      id_item: req.body.id_item,
      id_pelapak: req.body.id_pelapak,
      rating: req.body.rating,
      review: req.body.review,
    };

    const result = await CreateReviewItemModel(data);
    // console.log(result);
    res.status(201).send({
      data: {
        id: result[1].insertId,
        msg: "Review is created",
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      error: {
        msg: error.message || "Something wrong!",
      },
    });
  }
};

exports.UpdateReviewController = async (req, res) => {
  try {
    if (!Object.keys(req.body).length > 0) {
      throw new Error("Please add data to update");
    }

    const dataUpdate = {};
    const fillAble = ["rating", "review"];
    fillAble.forEach((v) => {
      if (req.body[v]) {
        dataUpdate[v] = req.body[v];
      }
    });

    const result = await UpdateReviewItemModel(req.params.id, dataUpdate);
    // console.log(result);
    res.status(200).send({
      data: {
        id: req.params.id,
        msg: "Your review is updated",
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

exports.GetReviewByUserController = async (req, res) => {
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

    const result = await GetReviewByUserModel(params, req.auth.id_user);
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

exports.GetReviewByIdController = async (req, res) => {
  try {
    const result = await GetReviewByIdModel(req.params.id);
    // console.log(result);

    if (result[1][0]) {
      res.status(200).send({
        data: result[1][0],
      });
    } else {
      res.status(404).send({
        error: {
          msg: "Review is not found",
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

exports.GetAllReviewController = async (req, res) => {
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

    const result = await GetAllReviewModel(params);
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

exports.GetReviewByIdItemController = async (req, res) => {
  try {
    const result = await GetReviewByIdItemModel(req.params.id);
    // console.log(result);
    if (result) {
      res.status(200).send({
        data: result[1],
      });
    } else {
      res.status(404).send({
        error: {
          msg: "Review is not found",
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
