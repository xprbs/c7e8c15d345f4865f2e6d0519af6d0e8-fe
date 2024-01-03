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
  Menu,
  MenuItem,
  Divider,
  FormControl
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'

// ** Next Import
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'

const Users = () => {
  // ** State
  const auth = useAuth()
  const router = useRouter()

  // PAGINATION
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

  const updateData = (k, v) => setData(prev => ({ ...prev, [k]: v }))

  const handleFilter = useCallback(val => {
    updateData('filterData', val)
    updateData('page', 1)
  }, [])

  // END PAGINATION

  // DELETE
  const [openDialogDelete, setOpenDialogDelete] = useState(false)
  const [dataDelete, setDataDelete] = useState({})
  const [isLoadingDelete, setIsLoadingDelete] = useState(false)

  const dialogDelete = data => {
    setDataDelete(data)
    setIsLoadingDelete(false)
    setOpenDialogDelete(!openDialogDelete)
  }

  const dialogDeleteClose = () => {
    setIsLoadingDelete(false)
    setOpenDialogDelete(!openDialogDelete)
  }

  const deleteHandler = e => {
    e.preventDefault()
    setIsLoadingDelete(true)

    const dataForm = JSON.stringify({
      row_id: dataDelete.row_id
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/user-delete', dataForm)
        .then(res => {
          resolve('success')
          dialogDeleteClose()
          updateData('reload', !data.reload)
        })
        .catch(error => {
          reject(error)
          dialogDeleteClose()
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

  // END DELETE

  // CHANGE PASSWORD
  const [openDialogChangePassword, setOpenDialogChangePassword] = useState(false)
  const [dataChangePassword, setDataChangePassword] = useState({})
  const [newPassword, setNewPassword] = useState()
  const [isLoadingChangePassword, setIsLoadingChangePassword] = useState(false)

  const dialogChangePassword = data => {
    setDataChangePassword(data)
    setIsLoadingChangePassword(false)
    setOpenDialogChangePassword(!openDialogChangePassword)
  }

  const dialogChangePasswordClose = () => {
    setIsLoadingChangePassword(false)
    setOpenDialogChangePassword(!openDialogChangePassword)
  }

  const handleChangePassword = e => {
    setNewPassword(e.target.value)
  }

  const ChangePasswordHandler = e => {
    e.preventDefault()
    setIsLoadingChangePassword(true)

    const dataForm = JSON.stringify({
      new_password: newPassword,
      user_uid: dataChangePassword.user_uid
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/user-change-password', dataForm)
        .then(res => {
          resolve('success')
          dialogChangePasswordClose()
          updateData('reload', !data.reload)
        })
        .catch(error => {
          reject(error)
          dialogChangePasswordClose()
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully Change Password',
      error: error => {
        if (error.response.status === 500) return error.response.data.response

        return 'Something error'
      }
    })
  }

  // END CHANGE PASSWORD

  //EDIT
  const handleEdit = e => {
    router.push(`/users/edit/${e.user_uid}`)
  }

  // END EDIT

  // LIST
  const RowOptions = ({ data }) => {
    // ** State
    const [anchorEl, setAnchorEl] = useState(null)
    const rowOptionsOpen = Boolean(anchorEl)

    const handleRowOptionsClick = e => {
      setAnchorEl(e.currentTarget)
    }

    const handleRowOptionsClose = () => {
      setAnchorEl(null)
    }

    return (
      <>
        <IconButton size='small' onClick={handleRowOptionsClick}>
          <Icon icon='basil:settings-adjust-solid' />
        </IconButton>
        <Menu
          keepMounted
          anchorEl={anchorEl}
          open={rowOptionsOpen}
          onClose={handleRowOptionsClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          PaperProps={{ style: { minWidth: '8rem' } }}
        >
          <MenuItem sx={{ '& svg': { mr: 2 } }}>{data.name}</MenuItem>
          <Divider />
          <MenuItem onClick={() => dialogChangePassword(data)} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='ic:baseline-lock-reset' fontSize={20} />
            Change Password
          </MenuItem>
          <MenuItem onClick={() => handleEdit(data)} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='material-symbols:edit-document-outline' fontSize={20} />
            Edit
          </MenuItem>
          <MenuItem onClick={() => dialogDelete(data)} sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mingcute:delete-2-line' fontSize={20} />
            Delete
          </MenuItem>
        </Menu>
      </>
    )
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
        .post('/web/master/user-list', dataForm)
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
      flex: 1,
      minWidth: 200,
      field: 'name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
    },
    {
      flex: 1,
      minWidth: 200,
      field: 'username',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Username</Typography>
    },
    {
      flex: 1,
      minWidth: 200,
      field: 'email',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Email</Typography>
    },
    {
      flex: 1,
      minWidth: 200,
      field: 'role_name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Role</Typography>
    },
    {
      flex: 0.15,
      minWidth: 115,
      sortable: false,
      filterable: false,
      field: 'actions',
      disableColumnMenu: true,
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>,
      renderCell: ({ row }) => <RowOptions data={row} />
    }
  ]

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader title={<Typography variant='h5'>User List</Typography>} subtitle={null} />
        </Grid>
        <Grid item xs={12}>
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
              <Button sx={{ mb: 2.5 }} component={Link} variant='contained' href='/users/create' size='small'>
                Create
              </Button>
              <TextField
                type={'search'}
                size='small'
                sx={{ mr: 4, mb: 2.5 }}
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

      <Dialog fullWidth onClose={dialogDeleteClose} open={openDialogDelete}>
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
                    <TableCell>Name</TableCell>
                    <TableCell>Username</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={dataDelete.row_id}>
                    <TableCell>{dataDelete.name}</TableCell>
                    <TableCell>{dataDelete.username}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important', mt: 2 } }}>
              <Button size='large' type='submit' variant='contained' color='error' disabled={isLoadingDelete}>
                Delete
                {isLoadingDelete && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button type='reset' size='large' variant='outlined' color='secondary' onClick={dialogDeleteClose}>
                Cancel
              </Button>
            </Box>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog fullWidth onClose={dialogChangePasswordClose} open={openDialogChangePassword}>
        <DialogTitle sx={{ pt: 6, mx: 'auto', textAlign: 'center' }}>
          <Typography variant='h5' component='span' sx={{ mb: 2 }}>
            Change Password
          </Typography>
          <Typography variant='body2'>Change your password regularly and save your credential!</Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 6, mx: 'auto' }}>
          <form onSubmit={ChangePasswordHandler}>
            <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important', mt: 2 } }}>
              <Grid container>
                <Grid item xs={12}>
                  <TextField
                    onChange={handleChangePassword}
                    size='medium'
                    fullWidth
                    name='new_password'
                    type={'password'}
                    label='Change Password'
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
              <Button size='large' type='submit' variant='contained' color='primary' disabled={isLoadingChangePassword}>
                Change Password
                {isLoadingChangePassword && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
              </Button>
              <Button
                type='reset'
                size='large'
                variant='outlined'
                color='secondary'
                onClick={dialogChangePasswordClose}
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

Users.acl = {
  action: 'manage',
  subject: 'users'
}

export default Users
