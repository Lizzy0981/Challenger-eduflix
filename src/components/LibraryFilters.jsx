import { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  IconButton,
  Chip,
  Stack,
  Button,
  Tooltip,
  Typography,
  Slider,
  Drawer
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorPrimary, colorWhite, colorGrayLight } from '../../UI/variablesStyle'
import FilterListIcon from '@mui/icons-material/FilterList'
import SortIcon from '@mui/icons-material/Sort'
import CloseIcon from '@mui/icons-material/Close'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { animations } from '../UI/animations'
import { VideosContext } from '../../../Context/Context'

const FILTER_TYPES = {
  NIVEL: 'nivel',
  DURACION: 'duracion',
  PROGRESO: 'progreso',
  CATEGORIA: 'categoria',
  INSTRUCTOR: 'instructor'
}

const NIVELES = ['Principiante', 'Intermedio', 'Avanzado']
const DURACIONES = ['0-30 min', '30-60 min', '60+ min']
const PROGRESOS = ['Completados', 'En progreso', 'No iniciados']

const FiltersContainer = styled(Box)(({ theme }) => ({
  margin: '1rem 0',
  padding: '1.5rem',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  ${animations.slideDown}
}))

const FilterGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  marginBottom: '1rem',
  flexWrap: 'wrap',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}))

const ActiveFilters = styled(Stack)(({ theme }) => ({
  marginTop: '1rem',
  flexWrap: 'wrap',
  gap: '0.5rem'
}))

const FilterDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: '350px',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(10px)',
    padding: '2rem',
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)'
  }
}))

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  color: selected ? colorWhite : colorGrayLight,
  background: selected ? colorPrimary : 'rgba(255, 255, 255, 0.1)',
  '&:hover': {
    background: selected ? colorPrimary : 'rgba(255, 255, 255, 0.2)'
  }
}))

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    color: colorWhite,
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.2)'
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)'
    },
    '&.Mui-focused fieldset': {
      borderColor: colorPrimary
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)'
  }
}))

function LibraryFilters({ onFilterChange }) {
  const { categorias } = useContext(VideosContext)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState({
    categoria: '',
    nivel: '',
    duracion: '',
    progreso: '',
    instructor: '',
    busqueda: ''
  })
  const [durationRange, setDurationRange] = useState([0, 120])

  const handleFilterChange = (field, value) => {
    const newFilters = {
      ...filters,
      [field]: value
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleDurationRangeChange = (event, newValue) => {
    setDurationRange(newValue)
    const range = getDurationRangeLabel(newValue)
    handleFilterChange('duracion', range)
  }

  const clearFilter = (field) => {
    handleFilterChange(field, '')
  }

  const clearAllFilters = () => {
    const emptyFilters = Object.keys(filters).reduce((acc, key) => ({
      ...acc,
      [key]: ''
    }), {})
    setFilters(emptyFilters)
    setDurationRange([0, 120])
    onFilterChange(emptyFilters)
  }

  const getDurationRangeLabel = (range) => {
    if (range[0] === 0 && range[1] === 120) return ''
    if (range[1] === 120) return `${range[0]}+ min`
    return `${range[0]}-${range[1]} min`
  }

  const formatDuration = (value) => `${value} min`

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  const getFilterLabel = (key, value) => {
    switch (key) {
      case FILTER_TYPES.CATEGORIA:
        return `Categoría: ${value}`
      case FILTER_TYPES.NIVEL:
        return `Nivel: ${value}`
      case FILTER_TYPES.DURACION:
        return `Duración: ${value}`
      case FILTER_TYPES.PROGRESO:
        return `Progreso: ${value}`
      case FILTER_TYPES.INSTRUCTOR:
        return `Instructor: ${value}`
      default:
        return `${key}: ${value}`
    }
  }

  return (
    <FiltersContainer>
      <FilterGroup>
        <SearchField
          fullWidth
          placeholder="Buscar por título, descripción o instructor..."
          value={filters.busqueda}
          onChange={(e) => handleFilterChange('busqueda', e.target.value)}
          size="small"
        />

        <Tooltip title="Filtros avanzados">
          <IconButton 
            onClick={() => setShowAdvancedFilters(true)}
            sx={{ color: colorWhite }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>

        {activeFilterCount > 0 && (
          <Tooltip title="Limpiar filtros">
            <Button
              variant="outlined"
              startIcon={<RestartAltIcon />}
              onClick={clearAllFilters}
              sx={{ 
                color: colorWhite, 
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}
            >
              Limpiar ({activeFilterCount})
            </Button>
          </Tooltip>
        )}
      </FilterGroup>

      {activeFilterCount > 0 && (
        <ActiveFilters direction="row">
          {Object.entries(filters).map(([key, value]) => 
            value && (
              <FilterChip
                key={key}
                label={getFilterLabel(key, value)}
                onDelete={() => clearFilter(key)}
                size="small"
              />
            )
          )}
        </ActiveFilters>
      )}

      <FilterDrawer
        anchor="right"
        open={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3 
        }}>
          <Typography variant="h6" color={colorWhite}>
            Filtros avanzados
          </Typography>
          <IconButton 
            onClick={() => setShowAdvancedFilters(false)}
            sx={{ color: colorWhite }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Categoría
            </InputLabel>
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

          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Nivel
            </InputLabel>
            <Select
              value={filters.nivel}
              onChange={(e) => handleFilterChange('nivel', e.target.value)}
              label="Nivel"
            >
              <MenuItem value="">Todos</MenuItem>
              {NIVELES.map((nivel) => (
                <MenuItem key={nivel} value={nivel}>
                  {nivel}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box>
            <Typography 
              gutterBottom
              color={colorWhite}
              sx={{ mb: 2 }}
            >
              Duración (minutos)
            </Typography>
            <Slider
              value={durationRange}
              onChange={handleDurationRangeChange}
              valueLabelDisplay="auto"
              valueLabelFormat={formatDuration}
              min={0}
              max={120}
              sx={{
                color: colorPrimary,
                '& .MuiSlider-valueLabel': {
                  background: colorPrimary
                }
              }}
            />
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              mt: 1
            }}>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                {formatDuration(durationRange[0])}
              </Typography>
              <Typography variant="caption" color="rgba(255, 255, 255, 0.7)">
                {formatDuration(durationRange[1])}
              </Typography>
            </Box>
          </Box>

          <FormControl fullWidth>
            <InputLabel sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Progreso
            </InputLabel>
            <Select
              value={filters.progreso}
              onChange={(e) => handleFilterChange('progreso', e.target.value)}
              label="Progreso"
            >
              <MenuItem value="">Todos</MenuItem>
              {PROGRESOS.map((progreso) => (
                <MenuItem key={progreso} value={progreso}>
                  {progreso}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            onClick={() => setShowAdvancedFilters(false)}
            fullWidth
            sx={{ mt: 2 }}
          >
            Aplicar filtros
          </Button>
        </Stack>
      </FilterDrawer>
    </FiltersContainer>
  )
}

LibraryFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired
}

export default LibraryFilters