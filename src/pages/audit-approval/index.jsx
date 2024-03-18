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
  CardContent
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

const AuditApprovalPage = () => {
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

  const router = useRouter()

  const updateData = (k, v) => setData(prev => ({ ...prev, [k]: v }))

  const handleFilter = useCallback(val => {
    updateData('filterData', val)
    updateData('page', 1)
  }, [])

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
        .post('/web/approval/audit', dataForm)
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

  const handleSetApproval = e => {
    router.push(`/audit-approval/approval/${e.audit_uid}`)
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
          <MenuItem sx={{ '& svg': { mr: 2 } }} onClick={() => handleSetApproval(data)}>
            <Icon icon='ant-design:audit-outlined' fontSize={20} />
            Approval
          </MenuItem>
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
      flex: 0.75,
      minWidth: 100,
      field: 'audit_number',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Number</Typography>
    },
    {
      flex: 1,
      minWidth: 100,
      field: 'audit_name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Doc Name</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'dataAreaId',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Company</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'audit_category',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Category</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'audit_location',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Location</Typography>
    },
    {
      flex: 0.5,
      minWidth: 100,
      field: 'status_name',
      renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Status</Typography>
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
          <PageHeader title={<Typography variant='h5'>Approval</Typography>} subtitle={null} />
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
              <Typography variant='h6'>Pending Approval</Typography>
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
    </>
  )
}

AuditApprovalPage.acl = {
  action: 'manage',
  subject: 'audit-approval'
}

export default AuditApprovalPage
