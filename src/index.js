const APIkey = "b073635b-9f03-417e-b2a9-49befe751851";
const baseURL = "https://api.thecatapi.com/v1/images/search";
const uploadURL = "https://api.thecatapi.com/v1/images/upload";
const uploaded = "https://api.thecatapi.com/v1/images/";
const components = {
  loading: {
    template: `<div class="loading">
                <img src="./src/assets/loading.png" alt="LOADING..." />
              </div>`,
  },
};

const App = {
  data() {
    return {
      messages: {
        fileUploadedMessage:
          "Conrad! The photo with a cat was loaded successfully!",
        noCatsMessage: "There are no cats in the picture",
        invalidPicture: "Something wrong with your picture",
        tryAgainMessage: "Please, try with another picture.",
        emptyFilesMessage: "You haven't uploaded any pictures",
      },
      myCats: false,
      openForm: false,
      images: [],
      myImages: [],
      limit: 9,
      page: 1,
      viewMode: "many",
      hide: false,
      file: null,
      uploadText: "Choose your Cat",
      uploadingFile: false,
      removing: false,
      error: false,
      fileUploaded: false,
    };
  },
  methods: {
    async getCats(url, limit) {
      try {
        const response = await axios.get(url, {
          headers: {
            "x-api-key": APIkey,
          },
          params: {
            limit: limit,
            page: this.page,
          },
        });
        return response;
      } catch (err) {
        console.log(err);
      }
    },

    changeOpenedPage() {
      this.myCats = !this.myCats;
    },

    loadMoreCats() {
      this.hide = true;
      this.page = this.page + 1;
      this.getCats(baseURL, this.page).then((response) => {
        this.images.push(...response.data);
        this.hide = false;
      });
    },

    toggleForm(event) {
      event.preventDefault();
      this.openForm = !this.openForm;
    },

    handlerForm(event) {
      if (event.target.classList.contains("add-cat-form")) {
        this.openForm = !this.openForm;
      }
    },
    handlerScroll(event) {
      if (
        event.target.scrollTop > this.$refs.content.clientHeight / 3 &&
        this.$refs.loadButton !== null
      ) {
        this.$refs.loadButton.click();
      }
    },

    uploadFile() {
      this.file = this.$refs.file.files[0];
      this.uploadText = this.file.name;
      this.error = false;
    },

    handlerSubmit() {
      if (!this.file) {
        this.error = true;
        this.uploadText = "You need to load file first";
        setTimeout(() => {
          this.uploadText = "Click here, please!";
        }, 2000);
        return;
      }

      this.error = false;
      this.uploadingFile = true;
      const formData = new FormData();
      formData.append("file", this.file);
      axios({
        method: "post",
        url: uploadURL,
        data: formData,
        headers: {
          "Content-type": "multipart/form-data",
          "x-api-key": APIkey,
        },
      })
        .then((response) => {
          this.getMyCats();
          this.uploadingFile = false;
          this.fileUploaded = true;
          setTimeout(() => {
            this.openForm = !this.openForm;
            this.myCats = true;
            this.fileUploaded = false;
          }, 2000);
        })
        .catch((error) => {
          this.error = true;
          console.log(error.response.data.message);
          if (
            error.response.data.message ===
            `Invalid file data. Check you are sending the formdata.append('file', ...} format'`
          ) {
            this.uploadText = "File isn't a picture";
          } else if (
            error.response.data.message ===
            `Classifcation failed: correct animal not found.`
          ) {
            this.uploadText = this.messages.noCatsMessage;
            setTimeout(() => {
              this.uploadText = this.messages.tryAgainMessage;
            }, 2500);
          } else {
            this.uploadText = this.messages.invalidPicture;
            setTimeout(() => {
              this.uploadText = this.messages.tryAgainMessage;
            }, 2500);
          }
          this.uploadingFile = false;
        });
    },

    getMyCats() {
      axios({
        method: "get",
        url: uploaded,
        headers: {
          "x-api-key": APIkey,
        },
        params: {
          limit: 99,
        },
      })
        .then((response) => {
          console.log(response);
          this.myImages = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    removeImage(id) {
      this.removing = true;
      axios({
        method: "DELETE",
        url: uploaded + id,
        headers: {
          "x-api-key": APIkey,
        },
      })
        .then((response) => {
          console.log(response);
          this.getMyCats();
          this.removing = false;
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },

  mounted() {
    this.getCats(baseURL, this.limit).then((response) =>
      this.images.push(...response.data)
    );

    this.getMyCats();
    console.log(this.myImages.length);
  },
};

Vue.createApp(App).component("Loading", components.loading).mount("#app");
