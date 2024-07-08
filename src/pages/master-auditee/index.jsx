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

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

// ** Third Party Imports
import * as yup from 'yup'
import { useForm, setValue, reset } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'

const schema = yup.object().shape({
  auditee_name: yup.string().required('Auditee Name is a required field')
  //   auditee_category: yup.string().required('Auditee Category is a required field')
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
  const [dataUpdate, setDataUpdate] = useState({})
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false)
  const [isLoadingCreate, setIsLoadingCreate] = useState(false)
  const [createData, setCreateData] = useState('')
  //   const [auditeecategory, setAuditeeCategory] = useState(null)
  //   const [auditeecategoryId, setAuditeeCategoryId] = useState(null)
  const [auditeename, setAuditeeName] = useState(null)
  const [auditeenameId, setAuditeeNameId] = useState(null)

  const router = useRouter()

  const updateData = (k, v) => setData(prev => ({ ...prev, [k]: v }))

  const handleDialogToggleUpdate = data => {
    setDataUpdate(data)
    setIsLoadingUpdate(false)
    setOpenDialogAdd(!openDialogAdd)
  }

  const handleDialogToggleUpdateClose = () => {
    setIsLoadingUpdate(false)
    setOpenDialogAdd(!openDialogAdd)
  }

  const handleFilter = useCallback(val => {
    updateData('filterData', val)
    updateData('page', 1)
  }, [])

  const updateHandler = e => {
    e.preventDefault()
      setIsLoadingUpdate(true)
      
      console.log('dataUpdate', dataUpdate);

    const dataForm = JSON.stringify({
      row_id: dataUpdate.row_id
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/auditee/update', dataForm)
        .then(res => {
          resolve('success')
          handleDialogToggleUpdateClose()
          updateData('reload', !data.reload)
        })
        .catch(error => {
          reject(error)
          handleDialogToggleUpdateClose()
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully update data',
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

  const createHandler = e => {
    e.preventDefault()
    setIsLoadingCreate(true)

    const dataForm = JSON.stringify({
      auditee_name: auditeenameId?.id
      //   auditee_category: auditeecategoryId?.id
    })

    const createPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/auditee/store', dataForm)
        .then(res => {
          resolve('success')
          updateData('reload', !data.reload)
          setCreateData('')
          //   setAuditeeCategoryId(null)
          setAuditeeNameId(null)
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
        .post('/web/master/auditee/list', dataForm)
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
      field: 'username',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Auditee Name</Typography>
    },
    {
      flex: 3,
      minWidth: 100,
      field: 'key2',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Is Active</Typography>,
      renderCell: params => <Typography>{params.value === '1' ? 'Yes' : 'No'}</Typography>
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
          <IconButton onClick={() => handleDialogToggleUpdate(row)}>
            <Icon icon='mdi:edit-outline' />
          </IconButton>
        </Box>
      )
    }
  ]

  async function getInitName() {
    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/auditee/userlist')
        .then(res => {
          setAuditeeName(res.data.data)
          resolve('success')
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })
  }

  useEffect(() => {
    getInitName()
  }, [])

  //   async function getInitCategory() {
  //     new Promise((resolve, reject) => {
  //       backendApi
  //         .post('/web/master/auditee/category')
  //         .then(res => {
  //           setAuditeeCategory(res.data.data)
  //           resolve('success')
  //         })
  //         .catch(error => {
  //           console.log(error)
  //           reject(error)
  //         })
  //     })
  //   }

  //   useEffect(() => {
  //     getInitCategory()
  //   }, [])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader title={<Typography variant='h5'>Master Auditee</Typography>} subtitle={null} />
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ mb: 6 }}>
            <CardHeader title={<Typography variant='h6'>Create</Typography>}></CardHeader>
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <Autocomplete
                      size='small'
                      options={auditeename}
                      fullWidth
                      renderInput={params => (
                        <TextField
                          {...params}
                          {...register('auditee_name')}
                          label='Auditee Name'
                          placeholder='Auditee Name'
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errors.auditee_name)}
                        />
                      )}
                      onChange={(event, newValue) => {
                        setAuditeeNameId(newValue)
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={auditeenameId}
                    />
                    {errors.auditee_name && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.auditee_name.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                {/* <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <Autocomplete
                      size='small'
                      options={auditeecategory}
                      fullWidth
                      renderInput={params => (
                        <TextField
                          {...params}
                          {...register('auditee_category')}
                          label='Auditee Category'
                          placeholder='Auditee Category'
                          InputLabelProps={{ shrink: true }}
                          error={Boolean(errors.auditee_category)}
                        />
                      )}
                      onChange={(event, newValue) => {
                        setAuditeeCategoryId(newValue)
                      }}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      value={auditeecategoryId}
                    />
                    {errors.auditee_category && (
                      <FormHelperText sx={{ color: 'error.main' }}>{errors.auditee_category.message}</FormHelperText>
                    )}
                  </FormControl>
                </Grid> */}
                <Grid item={true}>
                  <Button variant='outlined' onClick={createHandler} disabled={isLoadingCreate}>
                    Create {isLoadingCreate && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                  </Button>
                </Grid>
              </Grid>
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

      <Dialog fullWidth onClose={handleDialogToggleUpdateClose} open={openDialogAdd}>
        <DialogTitle sx={{ pt: 6, mx: 'auto', textAlign: 'center' }}>
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Are you sure to update data ?
          </Typography>
          <Typography variant='body2'>After you update, you can update data again.</Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 6, mx: 'auto' }}>
          <form onSubmit={updateHandler}>
            <TableContainer sx={{ mb: 6 }}>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>Auditee Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={dataUpdate.row_id}>
                    <TableCell>{dataUpdate.username}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important', mt: 2 } }}>
              {/* <Button size='large' type='submit' variant='contained' color='error' disabled={isLoadingUpdate}>
                Non Active
                {isLoadingUpdate && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button> */}
              <Button
                size='large'
                type='submit'
                variant='contained'
                color={dataUpdate.key2 === '1' ? 'error' : 'primary'}
                disabled={isLoadingUpdate}
              >
                {dataUpdate.key2 === '1' ? 'Non Active' : 'Active'}
                {isLoadingUpdate && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button
                type='reset'
                size='large'
                variant='outlined'
                color='secondary'
                onClick={handleDialogToggleUpdateClose}
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
  subject: 'audit-category'
}

export default AuditCategoryPage
