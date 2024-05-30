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
  Menu
} from '@mui/material'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'

const SurveillancePage = () => {
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
      row_id: dataDelete.acl_subject
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/surveillance/delete', dataForm)
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
        .post('/web/surveillance/list', dataForm)
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

  const handleSetDetail = e => {
    router.push(`/surveillance/detail/${e.project_uid}`)
  }

  const handleFollowUp = e => {
    router.push(`/surveillance/follow-up/${e.project_uid}`)
  }

  const handleClosed = e => {
    router.push(`/surveillance/closed/${e.project_uid}`)
  }

  const handleHistorical = e => {
    router.push(`/surveillance/historical/${e.project_uid}`)
  }

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
          <MenuItem sx={{ '& svg': { mr: 2 } }}>{data.project_name}</MenuItem>
          <Divider />
          <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => handleSetDetail(data)}>
            <Icon icon='bx:detail' fontSize={20} />
            Detail
          </MenuItem>
          {data.is_she === 'SHE' && data.status_code === '10' ? (
            <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => handleFollowUp(data)}>
              <Icon icon='hugeicons:recycle-03' fontSize={20} />
              Follow Up
            </MenuItem>
          ) : (
            ''
          )}
          {data.is_she === 'SHE' && data.status_code === '20' ? (
            <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => handleClosed(data)}>
              <Icon icon='hugeicons:recycle-03' fontSize={20} />
              Closed by SHE
            </MenuItem>
          ) : (
            ''
          )}
          <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => handleHistorical(data)}>
            <Icon icon='hugeicons:recycle-03' fontSize={20} />
            Historical
          </MenuItem>
          {/* <MenuItem sx={{ '& svg': { mr: 2 } }}>
            <Icon icon='mingcute:delete-2-line' fontSize={20} />
            Delete
          </MenuItem> */}
        </Menu>
      </>
    )
  }

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
      flex: 0.4,
      minWidth: 100,
      field: 'project_number',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Project Number</Typography>
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'project_name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'project_location',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Location </Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'status',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Status</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'is_she',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Category</Typography>
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
          <PageHeader title={<Typography variant='h5'>Surveillance</Typography>} subtitle={null} />
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
              <Grid>
                <Button sx={{ mb: 2.5 }} component={Link} variant='contained' href='/surveillance/create' size='small'>
                  Create
                </Button>
                <Button
                  sx={{ mb: 2.5, ml: 2.5 }}
                  component={Link}
                  variant='contained'
                  href='#'
                  size='small'
                  color='warning'
                >
                  Import
                </Button>
              </Grid>
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
                    <TableCell>Menu Type</TableCell>
                    <TableCell>Menu Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={dataDelete.row_id}>
                    <TableCell>{dataDelete.menus_type}</TableCell>
                    <TableCell>{dataDelete.menus_name}</TableCell>
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

SurveillancePage.acl = {
  action: 'manage',
  subject: 'surveillance'
}

export default SurveillancePage
