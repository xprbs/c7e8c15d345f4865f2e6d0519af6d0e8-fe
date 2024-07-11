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

import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'

const QuestionTemplatePage = () => {
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

  const router = useRouter()

  const updateData = (k, v) => setData(prev => ({ ...prev, [k]: v }))

  const handleFilter = useCallback(val => {
    updateData('filterData', val)
    updateData('page', 1)
  }, [])

  const updateHandler = e => {
    e.preventDefault()
    setIsLoadingUpdate(true)

    const dataForm = JSON.stringify({
      row_id: dataUpdate.row_id
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/question-template/update', dataForm)
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
        .post('/web/master/question-template/list', dataForm)
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
    router.push(`/question-template/set-detail/${e.question_uid}`)
  }

  const handleDialogToggleUpdate = e => {
    setDataUpdate(e)
    setIsLoadingUpdate(false)
    setOpenDialogAdd(!openDialogAdd)
  }

  const handleDialogToggleUpdateClose = () => {
    setIsLoadingUpdate(false)
    setOpenDialogAdd(!openDialogAdd)
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
          <MenuItem sx={{ '& svg': { mr: 2 } }}>{data.question_name}</MenuItem>
          <Divider />
          <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => handleSetDetail(data)}>
            <Icon icon='lucide:settings-2' fontSize={20} />
            Set Detail Question
          </MenuItem>
          <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => handleDialogToggleUpdate(data)}>
            <Icon icon='mingcute:flag-1-fill' fontSize={20} />
            Change Isactive
          </MenuItem>
        </Menu>
      </>
    )
  }

  const columns = [
    {
      field: 'id',
      flex: 0.15,
      minWidth: 25,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: row => row.id,
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>#</Typography>
    },
    {
      flex: 0.4,
      minWidth: 100,
      field: 'question_number',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Number</Typography>
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'question_name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Name</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'question_dept',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Department</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'question_type',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Category</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'question_ref',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Refrence</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'inactive',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Is Active</Typography>,
      renderCell: params => <Typography>{params.value === '1' ? 'YES' : 'NO'}</Typography>
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
          <PageHeader title={<Typography variant='h5'>Master Question Template</Typography>} subtitle={null} />
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
                <Button
                  sx={{ mb: 2.5 }}
                  component={Link}
                  variant='contained'
                  href='/question-template/create'
                  size='small'
                >
                  Create Template
                </Button>
                <Button
                  sx={{ mb: 2.5, ml: 2.5 }}
                  component={Link}
                  variant='contained'
                  href='#'
                  size='small'
                  color='warning'
                >
                  Import Template
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
                    <TableCell>Question Template Master</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow key={dataUpdate.id}>
                    <TableCell>{dataUpdate.question_name}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
            <Box className='demo-space-x' sx={{ '& > :last-child': { mr: '0 !important', mt: 2 } }}>
              <Button
                size='large'
                type='submit'
                variant='contained'
                color={dataUpdate.inactive === '1' ? 'error' : 'primary'}
                disabled={isLoadingUpdate}
              >
                {dataUpdate.inactive === '1' ? 'Non Active' : 'Active'}
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

QuestionTemplatePage.acl = {
  action: 'manage',
  subject: 'question-template'
}

export default QuestionTemplatePage
