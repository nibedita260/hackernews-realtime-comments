import React, { Component } from "react";
import Pusher from "pusher-js";
import axios from "axios";
import "./App.css";

class App extends Component {
  state = {
    username: "",
    newComment: "",
    items: [],
    isLoaded: false,
  };

  updateInput = (event) => {
    const { name, value } = event.target;
    this.setState({
      [name]: value,
    });
  };

  postComment = (event) => {
    event.preventDefault();
    const { username, newComment } = this.state;
    if (username.trim() === "" || newComment.trim() === "") return;

    const data = {
      name: username,
      text: newComment,
      votes: 0,
    };

    axios
      .post("http://localhost:5000/comment", data)
      .then(() => {
        this.setState({
          username: "",
          newComment: "",
        });
      })
      .catch((error) => console.log(error));
  };

  vote = (id, num) => {
    axios.post("http://localhost:5000/vote", {
      id,
      vote: num,
    });
  };

  componentDidMount() {
    const pusher = new Pusher("<your app key>", {
      cluster: "<your app cluster>",
      encrypted: true,
    });

    axios.get(`http://hn.algolia.com/api/v1/items`).then((res) => {
      const items = res.data;
      this.setState({ items });
    });
  }

  render() {
    return (
      <div className="App">
        <ul>
          {this.state.items.map((item) => (
            <li>{item.author}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
