import { createContext, useContext, useEffect, useState } from 'react'
import './App.css'

const RouterContext = createContext(null);
const CommentsContext = createContext(null);
const PostIdContext = createContext(null);

const routes = [
  {
    id: crypto.randomUUID(),
    name: 'Home',
    url: '#/',
    element: <Home />,
  },
  {
    id: crypto.randomUUID(),
    name: 'About',
    url: '#/about',
    element: <About />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Posts',
    url: '#/posts',
    element: <Posts />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Contact',
    url: '#/contact',
    element: <Contact />,
  },
];

const notFound = {
  name: 'Page not found',
  element: <NotFound />,
  // url: '',
}

function getRoute(routeUrl) {
  const route = routes.find(x => x.url === routeUrl);
  return route ?? notFound;
}

const title = "App";

function setTitle(pageTitle) {
  document.title = `${pageTitle} - ${title}`;
}

function App() {
  const [route, setRoute] = useState(
    () => {
      if(location.hash.length < 2) {
        return routes[0];
      }

      return getRoute(location.hash);
    }
  );

  useEffect(() => {
    setTitle(route.name);
  }, [route]);

  useEffect(() => {
    window.addEventListener('hashchange', function() {
      setRoute(getRoute(location.hash));
    });
  }, []);

  return (
    <div className="container">
      <RouterContext.Provider value={route}>
        <Header />
        <Main />
        <Footer />
      </RouterContext.Provider>
    </div>
  )
}

function Main() {
  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState(null);

  return (
    <div className="main">
      <CommentsContext.Provider value={{comments, setComments}}>
        <PostIdContext.Provider value={{postId, setPostId}}>
          <Content />
          <Sidebar />
        </PostIdContext.Provider>
      </CommentsContext.Provider>
    </div>
  )
}

function Header() {
  return (
    <div className="header">
      <a href="#/" className='logo'>App</a>
      <Nav />
    </div>
  )
}

function Nav() {
  const route = useContext(RouterContext);

  return (
    <ul className="nav">
      {routes.map(x => 
        <li key={x.id}>
          <a href={x.url} className={route.url === x.url ? 'selected': ''}>{x.name}</a>
        </li>)}
    </ul>
  )
}

function Content() {
  const route = useContext(RouterContext);

  return (
    <div className="content">
      <h1>{route.name}</h1>
      {route.element}
    </div>
  )
}

function Footer() {
  return (
    <div className="footer">&copy; 2024</div>
  )
}

function Sidebar() {
  const {comments, setComments} = useContext(CommentsContext);
  const [getComments, setGetComments] = useState([]);
  const {postId, setPostId} = useContext(PostIdContext);



  function handleSubmit(e) {
    e.preventDefault();

    let formData = new FormData(e.target);
    let formObj = Object.fromEntries(formData);

    setGetComments([...getComments, {
      id: crypto.randomUUID(),
      postId: postId,
      yourComment: formObj.yourComment,
      user: {
        yourName: formObj.yourName
      }
    }]);

    e.target.reset();
  };

  console.log(getComments);

  return (
    <>  
      <div className="sidebar">
        <div className="widget">
          <h1>Comments</h1>

          <div className="commentSection" style={{display: `${postId ? 'flex' : 'none'}`}}>
            {comments.map(
              x => <p key={x.id}><strong>{x.user.fullName}</strong>{x.body}</p>
            )}

            {getComments.map(
              x => <p key={x.id} style={{display: `${x.postId === comments[0].postId ? 'flex' : 'none'}`}}><strong>{x.user.yourName}</strong>{x.yourComment}</p>
            )}
          </div>

          <div className="formSection" style={{display: `${postId ? 'block' : 'none'}`}}>
            <form className="formGroup" onSubmit={handleSubmit}>
              <input required type="text" name="yourName" placeholder="Adınız" />
              <input required type="text" name="yourComment" placeholder="Yorumunuz" />

              <button type="submit">Yorum yap</button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

function Home() {
  return (
    <>
    </>
  );
}

function About() {
  return (
    <>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
      <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Accusamus harum mollitia veniam, quidem fugiat corporis ab voluptatum odit sequi voluptate error repellat numquam nulla quae corrupti vero sunt delectus minus.</p>
    </>
  );
}

function Contact() {
  return (
    <>
    </>
  );
}

function Posts() {
  const {postId, setPostId} = useContext(PostIdContext);

  return (
    <>
      {postId 
        ?
        <PostDetail />
        :
        <PostList />
      }
    </>
  )
}

function PostList() {
  const {postId, setPostId} = useContext(PostIdContext);
  const [posts, setPosts] = useState([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(30);
  const [page, setPage] = useState(1);

  async function getData() {
    const skip = (page - 1) * limit;

    let fetchUrl = 'https://dummyjson.com/posts?';
    fetchUrl = `${fetchUrl}limit=${limit}&skip=${skip}`;

    const data = await fetch(fetchUrl).then(res => res.json());
    setPosts([...data.posts]);
    setTotal(data.total);
  }
  
  useEffect(() => {
    getData();
  }, [page, limit])

  function changePage(pageNumber) {
    setPage(pageNumber);
  }

  const pageCount = Math.ceil(total/limit);

  function handlePrevPage(e) {
    e.preventDefault();
    if((page-1) > 0) {
      setPage(page-1);
    }
  }

  function handleNextPage(e) {
    e.preventDefault();
    if((page+1) <= pageCount) {
      setPage(page+1);
    }
  }

  function handleChange(e) {
    setLimit(Number(e.target.value));
    setPage(1);
  }

  return (
    <>
      <label> 
        gösterilecek adet

        <select onChange={handleChange}>
          <option>30</option>
          <option>60</option>
          <option>90</option>
        </select> {total > 0 && `/ ${total}`}
      </label>

      {posts.map(x => 
        <h3 key={x.id}>{x.title}
          <a href={'#/posts/' + x.id} onClick={e => { e.preventDefault(); setPostId(x.id); }}>
            &gt;&gt;
          </a>
        </h3>
      )}

      {pageCount > 0 && 
        <ul className="pagination">
          <li><a href="#" onClick={handlePrevPage}>&lt;</a></li>
          {
            Array
              .from({ length: pageCount }, (v, i) => (i+1))
              .map(x => <li key={x}><a href="#" className={page === x ? 'activePage' : ''} onClick={e => { e.preventDefault(); changePage(x); }}>{x}</a></li>)
          }
          <li><a href="#" onClick={handleNextPage}>&gt;</a></li>
        </ul>
      }
    </>
  )
}

function PostDetail() {
  const {postId, setPostId} = useContext(PostIdContext);
  const [post, setPost] = useState({});
  const {comments, setComments} = useContext(CommentsContext);

  async function getData() {
    const postData = await fetch('https://dummyjson.com/posts/' + postId).then(r => r.json());
    const commentsData = await fetch(`https://dummyjson.com/posts/${postId}/comments`).then(r => r.json());
  
    setPost(postData);
    setComments(commentsData.comments);
  }

  useEffect(() => {
    getData();
  }, []);

  function handleClick(e) {
    e.preventDefault();
    setPostId(null);
  }

  return (
    <>
      <p><a href="#" onClick={handleClick}>back</a></p>
      <h3>{post.title}</h3>
      <p>{post.body}</p>
    </>
  )
}

function NotFound() {
  return (
    <p>Page not found. <a href="#/">return home</a></p>
  )
}

export default App
