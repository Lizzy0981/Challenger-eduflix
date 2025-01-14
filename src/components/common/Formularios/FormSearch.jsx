import { useContext, useState } from 'react'
import { VideosContext } from '../../../Context/Context'
import { 
  Box, 
  TextField, 
  Typography,
  IconButton,
  Collapse,
  Button,
  Slider,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Chip,
  Stack,
  Drawer
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorGrayMedium, colorPrimary, colorWhite } from '../../UI/variablesStyle'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import FilterListIcon from '@mui/icons-material/FilterList'
import CloseIcon from '@mui/icons-material/Close'
import { animations } from '../UI/animations'

const FormMain = styled('form')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  margin: '7rem auto',
  width: '60%',
  backgroundColor: colorGrayMedium,
  padding: '2rem',
  borderRadius: '1rem',
  border: `2px solid ${colorPrimary}`,
  boxShadow: `0 4px 20px rgba(42, 122, 228, 0.15)`,
  transition: 'all 0.3s ease',
  '&:focus-within': {
    transform: 'translateY(-5px)',
    boxShadow: `0 8px 25px rgba(42, 122, 228, 0.25)`,
  },
  [theme.breakpoints.down('md')]: {
    width: '90%'
  },
  ${animations.slideUp}
}))

const TituloSearch = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: '1rem',
  color: colorPrimary,
  fontWeight: 'bold',
  ${animations.fadeIn}
}))

const SearchContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  alignItems: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}))

const FiltersContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '1rem'
}))

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  background: selected ? colorPrimary : 'transparent',
  color: selected ? colorWhite : colorPrimary,
  border: `1px solid ${colorPrimary}`,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: selected ? colorPrimary : 'rgba(42, 122, 228, 0.1)'
  }
}))

function FormSearch() {
  const { setSearch } = useContext(VideosContext)
  const [query, setQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState([])

  const filters = [
    { label: 'Principiante', category: 'nivel' },
    { label: 'Intermedio', category: 'nivel' },
    { label: 'Avanzado', category: 'nivel' },
    { label: '< 30 min', category: 'duracion' },
    { label: '30-60 min', category: 'duracion' },
    { label: '> 60 min', category: 'duracion' }
  ]

  const handleSearch = (e) => {
    setQuery(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSearch(query)
  }

  const toggleFilter = (filter) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  const clearFilters = () => {
    setSelectedFilters([])
  }

  const FilterDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
      width: '300px',
      padding: '2rem',
      background: colorGrayMedium
    }
  }))
  
  const FilterSection = styled(Box)(({ theme }) => ({
    marginBottom: '2rem'
  }))
  
  const FilterTitle = styled(Typography)(({ theme }) => ({
    color: colorPrimary,
    fontWeight: 'bold',
    marginBottom: '1rem'
  }))
  
  function FormSearch() {
    const { setSearch, categorias } = useContext(VideosContext)
    const [query, setQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
      categoria: '',
      nivel: '',
      duracion: [0, 120],
      instructor: ''
    })
    const [activeFilters, setActiveFilters] = useState([])
  
    const niveles = ['Principiante', 'Intermedio', 'Avanzado']
    const instructores = ['Carlos Ramírez', 'Ana Martínez', 'Pablo Rodríguez'] // Este array vendría de tu base de datos
  
    const handleSearch = (e) => {
      setQuery(e.target.value)
    }
  
    const handleFilterChange = (name, value) => {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }))
      updateActiveFilters(name, value)
    }
  
    const updateActiveFilters = (name, value) => {
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f.name !== name)
        if (value && value.length !== 0) {
          newFilters.push({ name, value })
        }
        return newFilters
      })
    }
  
    const removeFilter = (filterName) => {
      setFilters(prev => ({
        ...prev,
        [filterName]: filterName === 'duracion' ? [0, 120] : ''
      }))
      setActiveFilters(prev => prev.filter(f => f.name !== filterName))
    }
  
    const handleSubmit = (e) => {
      e.preventDefault()
      // Aquí implementarías la lógica para filtrar considerando todos los criterios
      const searchParams = {
        query,
        filters
      }
      setSearch(searchParams)
    }
  
    const formatDuracion = (value) => {
      return `${value} min`
    }
  
    return (
      <FormMain onSubmit={handleSubmit}>
        <TituloSearch variant='h4' component='h2'>
          Encuentra tu próximo curso
        </TituloSearch>
        
        <SearchContainer>
          <TextField
            fullWidth
            placeholder="Buscar cursos..."
            value={query}
            onChange={handleSearch}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
            }}
          />
          <IconButton onClick={() => setShowFilters(true)}>
            <FilterListIcon />
          </IconButton>
        </SearchContainer>
  
        {activeFilters.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            {activeFilters.map((filter) => (
              <Chip
                key={filter.name}
                label={`${filter.name}: ${filter.value}`}
                onDelete={() => removeFilter(filter.name)}
                color="primary"
                variant="outlined"
              />
            ))}
          </Stack>
        )}
  
        <FilterDrawer
          anchor="right"
          open={showFilters}
          onClose={() => setShowFilters(false)}
        >
          <FilterSection>
            <FilterTitle variant="h6">Filtros de búsqueda</FilterTitle>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                label="Categoría"
              >
                <MenuItem value="">Todas</MenuItem>
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.nombre}>
                    {cat.nombre}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Nivel</InputLabel>
              <Select
                value={filters.nivel}
                onChange={(e) => handleFilterChange('nivel', e.target.value)}
                label="Nivel"
              >
                <MenuItem value="">Todos</MenuItem>
                {niveles.map((nivel) => (
                  <MenuItem key={nivel} value={nivel}>
                    {nivel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom>Duración (minutos)</Typography>
              <Slider
                value={filters.duracion}
                onChange={(e, newValue) => handleFilterChange('duracion', newValue)}
                valueLabelDisplay="auto"
                valueLabelFormat={formatDuracion}
                min={0}
                max={120}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">
                  {formatDuracion(filters.duracion[0])}
                </Typography>
                <Typography variant="caption">
                  {formatDuracion(filters.duracion[1])}
                </Typography>
              </Box>
            </Box>
  
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Instructor</InputLabel>
              <Select
                value={filters.instructor}
                onChange={(e) => handleFilterChange('instructor', e.target.value)}
                label="Instructor"
              >
                <MenuItem value="">Todos</MenuItem>
                {instructores.map((instructor) => (
                  <MenuItem key={instructor} value={instructor}>
                    {instructor}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <Button 
              fullWidth 
              variant="contained" 
              onClick={() => setShowFilters(false)}
              sx={{ mt: 2 }}
            >
              Aplicar Filtros
            </Button>
          </FilterSection>
        </FilterDrawer>
      </FormMain>
    )
  }
  
  export default FormSearch 