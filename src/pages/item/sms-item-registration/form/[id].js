import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Card,
  Grid,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  FormHelperText
} from '@mui/material'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import axios from 'axios'
import { fetchProductCategories, fetchUom, getDynamicApiToken } from 'src/helpers/dynamicApi'

const SMSFormRegistration = () => {
  const router = useRouter()
  const { id } = router.query
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    item_type: '',
    item_description: '',
    parameter_value: '',
    stock_group: '',
    sub_stock_group: '',
    uom: '',
    min_stock: '',
    max_stock: '',
    lifetime: '',
    lifetime_uom: '',
    leadtime: '',
    part_no: '',
    specification: '',
    warehouse_location: ''
  })

  const [uomOptions, setUomOptions] = useState([])
  const [valuationOptions, setValuationOptions] = useState([])
  const [stockGroupOptions, setStockGroupOptions] = useState([])
  const [subStockGroupOptions, setSubStockGroupOptions] = useState([])
  const [typeOptions, setTypeOptions] = useState([])
  const [rawTypeOptions, setRawTypeOptions] = useState([])
  const [categoryOptions, setCategoryOptions] = useState([])
  const [storageOptions, setStorageOptions] = useState([])
  const [reservationOptions, setReservationOptions] = useState([])
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(null)

  const [formErrors, setFormErrors] = useState({
    // id_item: '',
    item_type: '',
    uom: '',
    ditem_type: '',
    ditem_category: '',
    item_description: '',
    sub_type: '',
    dimension: '',
    storage: '',
    reservation: ''
  })

  // Validation function
  const validateForm = () => {
    let errors = {}
    let isValid = true

    // Check required fields
    if (!formData.item_type) {
      errors.item_type = 'Item Group is required'
      isValid = false
    }
    if (!formData.uom) {
      errors.uom = 'UOM is required'
      isValid = false
    }
    if (!formData.ditem_type) {
      errors.ditem_type = 'Type is required'
      isValid = false
    }
    if (!formData.ditem_category) {
      errors.ditem_category = 'Category is required'
      isValid = false
    }
    if (!formData.item_description) {
      errors.item_description = 'Description is required'
      isValid = false
    }
    if (!formData.sub_type) {
      errors.sub_type = 'Sub Type is required'
      isValid = false
    }
    if (!formData.dimension) {
      errors.dimension = 'Dimension is required'
      isValid = false
    }
    if (!formData.storage) {
      errors.storage = 'Storage is required'
      isValid = false
    }
    if (!formData.reservation) {
      errors.reservation = 'Reservation is required'
      isValid = false
    }

    setFormErrors(errors)

    return isValid
  }

  const getToken = async () => {
    try {
      if (!token) {
        const response = await getDynamicApiToken()
        setToken(response)

        return response
      } else {
        return token
      }
    } catch (err) {
      console.log('Failed to fetch dynamic api token')
    }
  }

  const fetchBasicData = async (token, dataAreaId = 'sms', UnitSymbol = null, TranslatedDescription = null) => {
    try {
      const response = await backendApi.get('/web/sms')

      return response.data.data
    } catch (error) {
      console.log('Failed to fetch UOM', error.message)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = await getToken()

      const itemResponse = await backendApi.get(`/web/sms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setFormData(itemResponse.data)

      if (token) {
        const uom = await fetchUom(token)
        const basicData = await fetchBasicData(token)
        setToken(token)
        setValuationOptions(basicData.valuation_method)
        setStockGroupOptions(basicData.stock_group)
        setUomOptions(uom)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (formData.storage) {
      getReservation()
    }
  }, [formData.storage])

  const getReservation = async () => {
    const valueStorage = formData.storage
    console.log(valueStorage)
    let reservations = []
    if (['S', 'SW', 'SWL'].includes(valueStorage)) {
      reservations = [{ value: 'N', label: 'N' }]
    } else if (valueStorage === 'WMS') {
      reservations = [
        { value: 'N', label: 'N' },
        { value: 'B', label: 'B' }
      ]
    }
    setReservationOptions(reservations)
    setFormData(prevState => ({ ...prevState, reservation: reservations.length > 0 ? reservations[0].value : '' }))
  }

  const handleInputChange = event => {
    const { name, value } = event.target
    if (name == 'dcategory') {
      const selectedCategory = categoryOptions.find(category => category.CategoryCode === value)
      console.log(selectedCategory.CategoryName)
      setFormData(prevState => ({
        ...prevState,
        ditem_category: selectedCategory.CategoryName,
        dcategory: value
      }))
    } else {
      setFormData(prevState => ({ ...prevState, [name]: value }))
    }
  }

  const handleInputDescriptionChange = event => {
    const { name, value } = event.target
    setFormData(prevState => ({ ...prevState, [name]: value.toUpperCase() }))
  }

  const handleTypeChange = async event => {
    const { value } = event.target
    setFormData(prevState => ({ ...prevState, type: value, ditem_type: value }))

    try {
      const data = rawTypeOptions
      const filteredData = data.filter(item => item.ParentProductCategoryCode === value)
      setCategoryOptions(filteredData)
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubTypeChange = event => {
    const { value } = event.target
    setFormData(prevState => ({ ...prevState, sub_type: value }))

    if (value === 'ProductMaster') {
      setFormData(prevState => ({ ...prevState, dimension: 'Config | Size | Material/Color | Style' }))
    } else {
      setFormData(prevState => ({ ...prevState, dimension: '-' }))
    }
  }

  const handleStorageChange = async event => {
    const { value } = event.target
    setFormData(prevState => ({ ...prevState, storage: value }))

    // Determine reservation options based on selected storage
    let reservations = []
    if (['S', 'SW', 'SWL'].includes(value)) {
      reservations = [{ value: 'N', label: 'N' }]
    } else if (value === 'WMS') {
      reservations = [
        { value: 'N', label: 'N' },
        { value: 'B', label: 'B' }
      ]
    }
    setReservationOptions(reservations)
    setFormData(prevState => ({ ...prevState, reservation: reservations.length > 0 ? reservations[0].value : '' }))
  }

  const handleJustSubmit = async (event, status) => {
    event.preventDefault()
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem('userData'))

      const updatedFormData = {
        ...formData,
        company: 'SMS',
        created_by: user.name,
        trans_type: 'SUBMIT',
        ditem_product: formData.item_description
      }
      if (updatedFormData.dimension === 'Config | Size | Material/Color | Style') {
        updatedFormData.dimension = 'CoSiMaSt'
      }

      const response = await backendApi.post('/web/items/create', updatedFormData)
      const newItem = response.data

      const logData = {
        id_item: newItem.id_item,
        type: 'UPDATE',
        message: newItem.item_description,
        created_by: user.name
      }

      await backendApi.post('/web/log-items/create', logData)
      router.push('/item/sms-registration')
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAndSubmit = async event => {
    event.preventDefault()
    setLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem('userData'))

      const updatedFormData = {
        ...formData,
        status_cotte: 3,
        company: 'SMS',
        created_by: user.name
      }

      const response = await backendApi.post(`/web/sms/${id}`, updatedFormData)
      if (response.status === 201) {
        alert('Data berhasil diperbarui')
      } else {
        alert('error!')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <Box p={4}>
        <Typography variant='h5' gutterBottom>
          {isEdit ? 'Edit Item' : 'Create Item'}
        </Typography>
        <form onSubmit={e => handleSubmit(e, 1)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth error={Boolean(formErrors.item_type)}>
                <InputLabel>Item Type</InputLabel>
                <Select label='Item Type' name='item_type' value={formData.item_type} onChange={handleInputChange}>
                  <MenuItem value='0'>Stock Item</MenuItem>
                  <MenuItem value='1'>Fixed Asset</MenuItem>
                  <MenuItem value='2'>Seeding</MenuItem>
                  <MenuItem value='3'>Expenses</MenuItem>
                </Select>
                {formErrors.item_type && <Typography color='error'>{formErrors.item_type}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Description'
                name='item_description'
                value={formData.item_description}
                onChange={handleInputChange}
                InputProps={{ readOnly: false, style: { textTransform: 'uppercase' } }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth error={Boolean(formErrors.uom)}>
                <InputLabel>Valuation Method</InputLabel>
                <Select
                  label='valuation_method'
                  name='parameter_value'
                  value={formData.parameter_value}
                  onChange={handleInputChange}
                >
                  {valuationOptions.map(option => (
                    <MenuItem key={option.parameter_value} value={option.parameter_value}>
                      {option.parameter_value}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.uom && <Typography color='error'>{formErrors.uom}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.uom)}>
                <InputLabel>Stock Group</InputLabel>
                <Select
                  label='stock_group'
                  name='stock_group'
                  value={formData.stock_group}
                  onChange={e => handleStockGroupChange(e)}
                >
                  {stockGroupOptions.map(option => (
                    <MenuItem key={option.stock_group} value={option.stock_group}>
                      {option.stock_group}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.uom && <Typography color='error'>{formErrors.uom}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={Boolean(formErrors.uom)}>
                <InputLabel>Sub Stock Group</InputLabel>
                <Select
                  label='sub_stock_group'
                  name='sub_stock_group'
                  value={formData.sub_stock_group}
                  onChange={handleInputChange}
                >
                  {stockGroupOptions.map(option => (
                    <MenuItem key={option.sub_stock_group} value={option.sub_stock_group}>
                      {option.sub_stock_group}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.uom && <Typography color='error'>{formErrors.uom}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth error={Boolean(formErrors.uom)}>
                <InputLabel>UOM</InputLabel>
                <Select label='UOM' name='uom' value={formData.uom} onChange={handleInputChange}>
                  {uomOptions.map(option => (
                    <MenuItem key={option.UnitSymbol} value={option.UnitSymbol}>
                      {option.TranslatedDescription}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.uom && <Typography color='error'>{formErrors.uom}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label='Min Stock'
                name='min_stock'
                value={formData.min_stock}
                type={'number'}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label='Max Stock'
                name='max_stock'
                value={formData.max_stock}
                type={'number'}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label='Lifetime'
                name='lifetime'
                value={formData.lifetime}
                type={'number'}
                onChange={handleInputChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth error={Boolean(formErrors.lifetime_uom)}>
                <InputLabel>Lifetime UOM</InputLabel>
                <Select
                  label='Lifetime UOM'
                  name='lifetime_uom'
                  value={formData.lifetime_uom}
                  onChange={handleInputChange}
                >
                  <MenuItem value=''></MenuItem>
                  <MenuItem value='WK'>WK</MenuItem>
                  <MenuItem value='MT'>MT</MenuItem>
                  <MenuItem value='HR'>HR</MenuItem>
                </Select>
                {formErrors.lifetime_uom && <Typography color='error'>{formErrors.lifetime_uom}</Typography>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Lead Time'
                name='leadtime'
                value={formData.leadtime}
                onChange={handleInputChange}
                error={!!formErrors.leadtime}
                helperText={formErrors.leadtime}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Part No'
                name='part_no'
                value={formData.part_no}
                onChange={handleInputChange}
                error={!!formErrors.part_no}
                helperText={formErrors.part_no}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Specification'
                name='specification'
                value={formData.specification}
                onChange={handleInputChange}
                error={!!formErrors.specification}
                helperText={formErrors.specification}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <FormControl fullWidth error={Boolean(formErrors.warehouse_location)}>
                <InputLabel>Using Warehouse Location</InputLabel>
                <Select
                  label='Lifetime UOM'
                  name='warehouse_location'
                  value={formData.warehouse_location}
                  onChange={handleInputChange}
                >
                  <MenuItem value='0'>No</MenuItem>
                  <MenuItem value='1'>Yes</MenuItem>
                </Select>
                {formErrors.warehouse_location && (
                  <Typography color='error'>{formErrors.warehouse_location}</Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button variant='outlined' onClick={() => router.push('/item/sms-registration')}>
                Back
              </Button>
              <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <Button
                  variant='contained'
                  color='primary'
                  onClick={handleSaveAndSubmit}
                  disabled={loading || formData.status_cotte == 1 || formData.status == 1 || formData.status == 3}
                  sx={{ ml: 2 }}
                >
                  Update & Approval
                  {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Card>
  )
}

SMSFormRegistration.acl = {
  action: 'manage',
  subject: 'sms-registration-form'
}

export default SMSFormRegistration
