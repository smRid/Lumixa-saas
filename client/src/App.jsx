import { Route, Routes } from "react-router-dom"
import Home from "./pages/Home.jsx";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import GenerateImages from "./pages/GenerateImages";
import RemoveBackground from "./pages/RemoveBackground";
import RemoveObject from "./pages/RemoveObject";
import ImageEnhancer from "./pages/ImageEnhancer";
import PhotoRestoration from "./pages/PhotoRestoration";
import BackgroundBlur from "./pages/BackgroundBlur";
import LogoGenerator from "./pages/LogoGenerator";
import YoutubeThumbnailGenerator from "./pages/YoutubeThumbnailGenerator";
import { Toaster } from "react-hot-toast";

const App = () => {

  return (
    <div >
      <Toaster />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/ai' element={<Layout />} >
          <Route index element={<Dashboard />} />
          <Route path='generate-images' element={<GenerateImages />} />
          <Route path='remove-background' element={<RemoveBackground />} />
          <Route path='remove-object' element={<RemoveObject />} />
          <Route path='image-enhancer' element={<ImageEnhancer />} />
          <Route path='photo-restoration' element={<PhotoRestoration />} />
          <Route path='background-blur' element={<BackgroundBlur />} />
          <Route path='logo-generator' element={<LogoGenerator />} />
          <Route path='youtube-thumbnail-generator' element={<YoutubeThumbnailGenerator />} />
        </Route>
      </Routes>
    </div>



  )
}

export default App
