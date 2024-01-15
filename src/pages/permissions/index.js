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
  CardHeader,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { backendApi } from 'src/configs/axios'

const Permission = () => {
  // ** State
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
  const [permissionParent, setPermissionParent] = useState([])
  const [parentId, setParentId] = useState('')

  // console.log(parentId)

  const auth = useAuth()

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

    const deletePromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/permission-delete', dataForm)
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

    toast.promise(deletePromise, {
      loading: 'Loading',
      success: 'Successfully delete data',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  const createHandler = e => {
    e.preventDefault()
    setIsLoadingCreate(true)

    const dataForm = JSON.stringify({
      permissions_name: createData,
      parent_id: parentId.id
    })

    const createPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/permission-store', dataForm)
        .then(res => {
          resolve('success')
          updateData('reload', !data.reload)
          setCreateData('')
          setParentId('')
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

  const initDataPermission = async () => {
    await backendApi
      .post('/web/master/permission-parent')
      .then(response => {
        setPermissionParent(response.data.data)
      })
      .catch(error => {
        console.log(error)
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
        .post('/web/master/permission-list', dataForm)
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
    }

    initData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.page, data.pageSize, data.sort, data.filterData, data.reload])

  useEffect(() => {
    initDataPermission()
  }, [])

  const columns = [
    {
      field: 'id',
      flex: 0.1,
      minWidth: 75,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: row => row.id,
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>#</Typography>
    },
    {
      flex: 1,
      minWidth: 200,
      field: 'permissions_name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Permission</Typography>
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
          <IconButton>
            <Icon icon='mdi:pencil-outline' />
          </IconButton>
          <IconButton onClick={() => handleDialogToggleDelete(row)}>
            <Icon icon='mdi:delete-outline' />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader title={<Typography variant='h5'>Permission List</Typography>} subtitle={null} />
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ mb: 6 }}>
            <CardHeader title={<Typography variant='h6'>Create</Typography>}></CardHeader>
            <CardContent>
              <Grid container spacing={6}>
                <Grid item xs={9} lg={4}>
                  <TextField
                    fullWidth
                    placeholder='Permission'
                    label='Permission'
                    size='small'
                    value={createData || ''}
                    onChange={e => setCreateData(e.target.value)}
                  />
                </Grid>
                <Grid item xs={9} lg={4}>
                  <Autocomplete
                    size='small'
                    options={permissionParent}
                    fullWidth
                    renderInput={params => <TextField {...params} label='Parent' />}
                    onChange={(event, newValue) => {
                      setParentId(newValue)
                    }}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={parentId}
                  />
                </Grid>
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
                justifyContent: 'space-between'
              }}
            >
              <Typography variant='h6'>List</Typography>
              <TextField
                type={'search'}
                size='small'
                sx={{ mb: 2.5 }}
                placeholder='Search'
                onChange={e => handleFilter(e.target.value)}
              />
            </Box>
            <Box sx={{ px: 5 }}>
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
                    <TableCell>Permission Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={dataDelete.row_id}>
                    <TableCell>{dataDelete.permissions_name}</TableCell>
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

Permission.acl = {
  action: 'manage',
  subject: 'permissions'
}

export default Permission
