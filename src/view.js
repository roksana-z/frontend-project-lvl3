import i18next from "i18next";

export default (path, value, previousValue) => {
  const container = document.querySelector(".feeds-container");
  const formGroup = document.querySelector(".form-group");
  const input = document.querySelector("input");

  const renderFeed = ([feed]) => {
    const feedContainer = document.createElement("div");
    const h2 = document.createElement("h2");
    h2.innerHTML = feed.title;
    feedContainer.prepend(h2);
    feedContainer.setAttribute("id", feed.id);
    container.append(feedContainer);
  };

  const renderError = ([err]) => {
    const div = document.createElement("div");
    div.classList.add("invalid-feedback", "errors");
    div.innerHTML = i18next.t(err);
    const url = document.querySelector(".form-control");
    url.after(div);
  };

  const renderPosts = (posts, feed) => {
    // console.log(posts, feed);
    const currentPosts = posts.map((post) => post.id === feed.id);
    const feedContainer = document.getElementById(feed.id);
    const postsForFeedContainer = [];
    // if (feedContainer.childNodes.length > 1) {
    //   const h2 = feedContainer.childNodes[0];
    //   feedContainer.innerHTML = "";
    //   feedContainer.append(h2);
    // }
    currentPosts.forEach((post) => {
      const a = document.createElement("a");
      const div = document.createElement("div");
      a.setAttribute("href", post.link);
      a.innerHTML = post.text;
      div.append(a);
      postsForFeedContainer.push(div.outerHTML);
    });
    const div = document.createElement("div");
    div.innerHTML = postsForFeedContainer.join("\n");
    feedContainer.append(div);
  };

  const renderValidation = (valid) => {
    if (valid) {
      input.classList.remove("is-invalid");
    } else {
      input.classList.add("is-invalid");
    }
  };
  console.log(value, previousValue);
  if (path === "form.valid") {
    renderValidation(value);
  }
  if (path === "form.errors") {
    renderError(value);
  }
  if (path === "feeds") {
    renderFeed(value);
  }
  if (path === "posts") {
    renderPosts(value, previousValue);
  }
  if (path === "feedsProcess.state" && value === "readyToLoad") {
    input.value = "";
    const errors = document.querySelectorAll(".errors");

    Array.from(errors).forEach((error) => {
      const children = Array.from(formGroup.childNodes);
      const index = children.indexOf(error);
      formGroup.removeChild(formGroup.childNodes[index]);
    });
  }
};
