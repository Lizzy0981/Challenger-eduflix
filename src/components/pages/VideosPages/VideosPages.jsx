import { useContext } from 'react'
import { Box, LinearProgress } from '@mui/material'
import { styled } from '@mui/material/styles'
import { VideosContext } from '@context/Context'
import { FormSearch, VideoCard } from '@components/common'

const BoxVideos = styled(Box)(({ theme }) => ({
  margin: '5rem auto',
  width: '80%',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gridGap: '2rem',
  height: '100%'
}))

function VideosPages() {
  const { videos, categorias, data } = useContext(VideosContext)

  const renderVideoCards = videosToRender => {
    return videosToRender
      .map(video => {
        const categoria = categorias.find(cat => cat.nombre === video.categoria)
        if (categoria) {
          return <VideoCard key={video.id} video={video} color={categoria.color} />
        }
        return null
      })
      .filter(Boolean) // Elimina los null del mapeo
  }

  if (videos.length === 0) {
    return <LinearProgress size={40} />
  }

  return (
    <>
      <FormSearch />
      <BoxVideos>{renderVideoCards(data.length > 0 ? data : videos)}</BoxVideos>
    </>
  )
}

export default VideosPages
