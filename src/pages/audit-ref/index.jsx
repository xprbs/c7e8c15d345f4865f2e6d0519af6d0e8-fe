// ** React Imports
import { useState, useEffect, useCallback } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import { DataGrid } from '@mui/x-data-grid'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TableBody,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  CircularProgress,
  MenuItem,
  Divider,
  Menu,
  CardHeader,
  CardContent,
  FormControl,
  Autocomplete,
  FormHelperText
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, setValue, reset } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'

const schema = yup.object().shape({
  audit_category_ref: yup.string().required('Audit Category Reference is a required field'),
  audit_category: yup.string().required('Audit Category is a required field')
})

const AuditCategoryPage = () => {
  const [data, setData] = useState({
    loading: true,
    rows: [],
    rowCount: 0,
    rowsPerPageOptions: [10, 50, 100],
    pageSize: 10,
    page: 1,
    sort: null,
    filterData: null,
    reload: false
  })

  const [openDialogAdd, setOpenDialogAdd] = useState(false)
  const [dataDelete, setDataDelete] = useState({})
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [createData, setCreateData] = useState('')
  const [isDisable, setIsDisable] = useState(false)
  const [auditcategory, setAuditCategory] = useState([])
  const [auditcategoryId, setAuditCategoryId] = useState(null)

  const router = useRouter()

  const updateData = (k, v) => setData(prev => ({ ...prev, [k]: v }))

  const handleDialogToggleDelete = data => {
    setDataDelete(data)
    setIsLoadingDelete(false)
    setOpenDialogAdd(!openDialogAdd)
  }

  const handleDialogToggleDeleteClose = () => {
    setIsLoadingDelete(false)
    setOpenDialogAdd(!openDialogAdd)
  }

  const handleFilter = useCallback(val => {
    updateData('filterData', val)
    updateData('page', 1)
  }, [])

  const deleteHandler = e => {
    e.preventDefault()
    setIsLoadingDelete(true)

    const dataForm = JSON.stringify({
      row_id: dataDelete.row_id
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/audit-category-ref/delete', dataForm)
        .then(res => {
          resolve('success')
          handleDialogToggleDeleteClose()
          updateData('reload', !data.reload)
        })
        .catch(error => {
          reject(error)
          handleDialogToggleDeleteClose()
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully delete data',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema)
  })

  async function createHandler() {
    setIsDisable(true)

    const dataForm = JSON.stringify({
      audit_category_ref: createData,
      audit_category: auditcategoryId?.id
    })

    const createPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/audit-category-ref/store', dataForm)
        .then(res => {
          resolve('success')
          updateData('reload', !data.reload)
          setAuditCategoryId(null)
          setCreateData(null)
          reset()
        })
        .catch(error => {
          reject(error)
        })
        .finally(() => {
          setIsLoadingCreate(false)
        })
    })

    toast.promise(createPromise, {
      loading: 'Loading',
      success: 'Successfully Create data',
      error: error => {
        if (error.response.status === 400) return error.response.data.permissions_name
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  useEffect(() => {
    const initData = async () => {
      updateData('loading', true)

      const dataForm = JSON.stringify({
        limit: data.pageSize,
        page: data.page,
        sort: data.sort,
        filterData: data.filterData
      })

      await backendApi
        .post('/web/master/audit-category-ref/list', dataForm)
        .then(response => {
          updateData('rowCount', response.data.total)
          setTimeout(() => {
            updateData('rows', response.data.data)
            updateData('loading', false)
          }, 100)
        })
        .catch(error => {
          console.log(error)
        })
        .finally(e => updateData('loading', false))
    }

    initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.page, data.pageSize, data.sort, data.filterData, data.reload])

  const columns = [
    {
      field: 'id',
      flex: 0.25,
      minWidth: 75,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: row => row.id,
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>#</Typography>
    },
    {
      flex: 3,
      minWidth: 100,
      field: 'value1',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Audit Category Reference</Typography>
    },
    {
      flex: 0.15,
      minWidth: 115,
      sortable: false,
      filterable: false,
      field: 'actions',
      disableColumnMenu: true,
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>,
      renderCell: ({ row }) => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => handleDialogToggleDelete(row)}>
            <Icon icon='mdi:delete-outline' />
          </IconButton>
        </Box>
      )
    }
  ]

  async function getInit() {
    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/get-audit-category')
        .then(res => {
          setAuditCategory(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  useEffect(() => {
    getInit()
  }, [])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader title={<Typography variant='h5'>Master Audit Category Reference</Typography>} subtitle={null} />
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ mb: 6 }}>
            <CardHeader title={<Typography variant='h6'>Create</Typography>}></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(createHandler)}>
                <Grid container spacing={6}>
                  <Grid item xs={9} lg={4}>
                    <TextField
                      {...register('audit_category_ref')}
                      fullWidth
                      name='audit_category_ref'
                      placeholder='Audit Category Reference'
                      label='Audit Category Reference'
                      size='small'
                      value={createData || ''}
                      onChange={e => setCreateData(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(errors.audit_category_ref)}
                      helperText={errors.audit_category_ref && errors.audit_category_ref.message}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <Autocomplete
                        size='small'
                        options={auditcategory}
                        fullWidth
                        renderInput={params => (
                          <TextField
                            {...params}
                            {...register('audit_category')}
                            label='Audit Category'
                            placeholder='Audit Category'
                            InputLabelProps={{ shrink: true }}
                            error={Boolean(errors.audit_category)}
                          />
                        )}
                        onChange={(event, newValue) => {
                          setAuditCategoryId(newValue)
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        value={auditcategoryId}
                      />
                      {errors.audit_category && (
                        <FormHelperText sx={{ color: 'error.main' }}>{errors.audit_category.message}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item={true}>
                    <Button variant='outlined' onClick={createHandler} disabled={isLoadingCreate}>
                      Create {isLoadingCreate && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>
          <Card>
            <Box
              sx={{
                p: 5,
                pb: 3,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}
            >
              <TextField
                type={'search'}
                size='small'
                sx={{ mr: 4, mb: 2.5 }}
                placeholder='Search'
                onChange={e => handleFilter(e.target.value)}
              />
            </Box>
            <Box
              sx={{
                px: 5
              }}
            >
              <DataGrid
                autoHeight
                rowHeight={40}
                columns={columns}
                disableSelectionOnClick
                disableColumnFilter
                disableColumnSelector
                getRowId={row => row.id}
                loading={data.loading}
                rows={data.rows}
                pageSize={data.pageSize}
                rowsPerPageOptions={data.rowsPerPageOptions}
                pagination
                page={data.page - 1}
                rowCount={data.rowCount}
                paginationMode='server'
                onPageChange={newPage => {
                  updateData('page', newPage + 1)
                }}
                onPageSizeChange={newPageSize => {
                  updateData('page', 1)
                  updateData('pageSize', newPageSize)
                }}
                sortingMode='server'
                onSortModelChange={newSort => {
                  updateData('page', 1)
                  updateData('sort', newSort)
                }}

                // sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 0 } }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Dialog fullWidth onClose={handleDialogToggleDeleteClose} open={openDialogAdd}>
        <DialogTitle sx={{ pt: 6, mx: 'auto', textAlign: 'center' }}>
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Are you sure to delete data ?
          </Typography>
          <Typography variant='body2'>After you delete, you can not undo this data.</Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 6, mx: 'auto' }}>
          <form onSubmit={deleteHandler}>
            <TableContainer sx={{ mb: 6 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={dataDelete.row_id}>
                    <TableCell>{dataDelete.value1}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important', mt: 2 } }}>
              <Button size='large' type='submit' variant='contained' color='error' disabled={isLoadingDelete}>
                Delete
                {isLoadingDelete && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button
                type='reset'
                size='large'
                variant='outlined'
                color='secondary'
                onClick={handleDialogToggleDeleteClose}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

AuditCategoryPage.acl = {
  action: 'manage',
  subject: 'audit-ref'
}

export default AuditCategoryPage
