/* eslint-disable lines-around-comment */

// ** React Imports
import { useState, useEffect } from 'react'

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
  Menu,
  MenuItem,
  Divider,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel
} from '@mui/material'

import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import Link from 'next/link'

import { useAuth } from 'src/hooks/useAuth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/router'
import { backendApi } from 'src/configs/axios'
import { TreeItem, TreeView } from '@mui/lab'
import { auto } from '@popperjs/core'

// import data from '../../../utils/tree.json'

const bfsSearch = (graph, targetId) => {
  const queue = [...graph]

  while (queue.length > 0) {
    const currNode = queue.shift()
    if (currNode.id === targetId) {
      return currNode
    }
    if (currNode.children) {
      queue.push(...currNode.children)
    }
  }

  return [] // Target node not found
}

const RoleSetPermission = () => {
  const router = useRouter()
  const { id } = router.query

  const [roleName, setRoleName] = useState([])
  const [permissionByRole, setPermissionByRole] = useState([])
  const [permission, setPermission] = useState([])
  const [permissionAll, setPermissionAll] = useState([])
  const [skeleton, setSkeleton] = useState(false)
  const [isDisable, setIsDisable] = useState(false)
  const [checked, setChecked] = useState([])
  const [expanded, setExpanded] = useState([])
  const [selected, setSelected] = useState([])
  const [skeleton2, setSkeleton2] = useState(false)
  const [permission2, setPermission2] = useState([])
  const [parent, setParent] = useState()

  // let permission_uid = permissionByRole.map(item => item.permission_uid)
  let data = permission

  const handleToggle = (event, nodeIds) => {
    setExpanded(nodeIds)
  }

  const handleSelect = (event, nodeIds) => {
    setSkeleton2(true)

    const dataForm = JSON.stringify({
      parent_id: nodeIds
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/permission-by-parent-id', dataForm)
        .then(res => {
          resolve('success')
          setPermission2(res.data.data)
          setParent(res.data.data_header)
        })
        .catch(error => {
          reject(error)
          console.log(error)
        })
        .finally(() => setSkeleton2(false))
    })
  }

  const handleExpandClick = () => {
    setExpanded(oldExpanded => (oldExpanded.length === 0 ? permissionAll : []))
  }

  const handleSelectClick = () => {
    setChecked(oldSelected => (oldSelected.length === 0 ? permissionAll : []))
    setExpanded(permissionAll)
  }

  const renderTree = nodes => (
    <TreeItem
      key={nodes.id}
      nodeId={nodes.id}
      label={
        <>
          <Checkbox value={nodes.id} onChange={handleCheckbox} checked={checked.includes(nodes.id)} />
          {/* {`${nodes.id} - ${nodes.name}`} */}
          {`${nodes.name}`}
        </>
      }
    >
      {Array.isArray(nodes.children) ? nodes.children.map(node => renderTree(node)) : null}
    </TreeItem>
  )

  const handleCheckbox = event => {
    var updatedList = [...checked]
    if (event.target.checked) {
      updatedList = [...checked, event.target.value]
    } else {
      if (checked.indexOf(event.target.value) !== -1) {
        updatedList.splice(checked.indexOf(event.target.value), 1)
      }
    }
    setChecked(updatedList)

    var seletedList = [...expanded]
    setExpanded(seletedList)
  }

  const saveSetPermission = async e => {
    e.preventDefault()
    setIsDisable(true)

    const dataForm = JSON.stringify({
      role_uid: id,
      permission_uid: checked
    })

    const myPromise = new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/permission-save', dataForm)
        .then(res => {
          setIsDisable(false)
          resolve('success')
          router.push('/roles')
        })
        .catch(error => {
          console.log(error)
          reject(error)
          setIsDisable(false)
        })
    })

    toast.promise(myPromise, {
      loading: 'Loading',
      success: 'Successfully update data',
      error: error => {
        if (error.response) {
          // The client was given an error response (5xx, 4xx)
          if (error.response.status === 500) return error.response.data.response
        }

        return 'Something error'
      }
    })
  }

  async function getData() {
    setSkeleton(true)

    const dataForm = JSON.stringify({
      role_uid: id
    })

    new Promise((resolve, reject) => {
      backendApi
        .post('/web/master/permission-by-role-id', dataForm)
        .then(res => {
          resolve('success')
          setSkeleton(false)
          setPermissionByRole(res.data.data.permission_by_role)
          setPermission(res.data.data.permission)
          setRoleName(res.data.data.role_name)

          const datax = res.data.data.permission_by_role
          const datay = datax.map(item => item.permission_uid)
          setChecked(datay)

          const data1 = res.data.data.permission_all
          const data2 = data1.map(item => item.permissions_uid)
          setPermissionAll(data2)
        })
        .catch(error => {
          console.log(error)
          setSkeleton(false)
          reject(error)
        })
    })
  }

  useEffect(() => {
    getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <PageHeader title={<Typography variant='h5'>Role List</Typography>} subtitle={null} />
      </Grid>
      <Grid item xs={12}>
        <Card>
          <CardHeader title='Set Permission' />
          <CardContent>
            {skeleton ? (
              <Grid>
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
                <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
              </Grid>
            ) : (
              <form onSubmit={saveSetPermission.bind(this)}>
                <Grid container spacing={4}>
                  <Grid container item>
                    <Grid item md={6} xs={12}>
                      <TextField
                        fullWidth
                        value={roleName}
                        aria-readonly
                        label='Role Name'
                        size='small'
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                  <Grid container item>
                    <Grid item xs={12} lg={6} md={6}>
                      <Box>
                        <Button onClick={handleExpandClick}>
                          {expanded.length === 0 ? 'Expand all' : 'Collapse all'}
                        </Button>
                        <Button onClick={handleSelectClick}>
                          {checked.length === 0 ? 'Select all' : 'Unselect all'}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid container item spacing={4}>
                    <Grid item xs={12} sm={6} lg={6} md={6}>
                      <TreeView
                        multiSelect
                        defaultCollapseIcon={<Icon icon='ep:arrow-right-bold' fontSize={20} />}
                        defaultExpandIcon={<Icon icon='ep:arrow-down-bold' fontSize={20} />}
                        expanded={expanded}
                        // selected={selected}
                        onNodeToggle={handleToggle}
                        onNodeSelect={handleSelect}
                      >
                        {data.map(node => renderTree(node))}
                      </TreeView>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={6} md={6}>
                      <Card sx={{ height: '100%' }}>
                        {skeleton2 ? (
                          <Grid sx={{ padding: 5 }}>
                            <Skeleton variant='text' sx={{ fontSize: '1rem' }} />
                            <Skeleton variant='text' sx={{ fontSize: '3rem' }} />
                          </Grid>
                        ) : (
                          <>
                            <CardHeader title={parent} />
                            <CardContent>
                              <Grid container direction='column' justifyContent='flex-start' alignItems='flex-start'>
                                {permission2.map((data, index) => (
                                  <FormControlLabel
                                    key={index}
                                    control={
                                      <Checkbox
                                        value={data.permissions_uid}
                                        checked={checked.includes(data.permissions_uid)}
                                        icon={<BookmarkBorderIcon />}
                                        checkedIcon={<BookmarkIcon />}
                                        onChange={handleCheckbox}
                                      />
                                    }
                                    label={data.permissions_name}
                                  />
                                ))}
                              </Grid>
                            </CardContent>
                          </>
                        )}
                      </Card>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        gap: 5,
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'left'
                      }}
                    >
                      <Button component={Link} href={'/roles'} variant='outlined' size='small'>
                        Back
                      </Button>
                      <Button type='submit' variant='contained' size='small' disabled={isDisable}>
                        Save Permission
                        {isDisable && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </form>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}
RoleSetPermission.acl = {
  action: 'manage',
  subject: 'role-set-permission'
}

export default RoleSetPermission
