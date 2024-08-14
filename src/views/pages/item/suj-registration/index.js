import React, { useState, useEffect, useCallback } from 'react';
import {
    Badge,
    Box,
    Card,
    Grid,
    Button,
    TextField,
    IconButton,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    CircularProgress,
    Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Icon from 'src/@core/components/icon';
import PageHeader from 'src/@core/components/page-header';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { backendApi } from 'src/configs/axios';

const SUJRegistration = () => {
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
    });

    const [searchText, setSearchText] = useState('');
    const [openDialogAdd, setOpenDialogAdd] = useState(false);
    const [isLoadingDelete, setIsLoadingDelete] = useState(false);
    const [openDialogApproval, setOpenDialogApproval] = useState(false);
    const [dataApproval, setDataApproval] = useState({});
    const [typeOptions, setTypeOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [historyData, setHistoryData] = useState([]);

    const updateData = (key, value) => setData(prev => ({ ...prev, [key]: value }));

    const handleDialogToggleDelete = async (rowData) => {
        setIsLoadingDelete(false);

        try {
            const response = await backendApi.post('/web/log-items', { id_item: rowData.id_item });
            setHistoryData(response.data);
        } catch (error) {
            console.error('Failed to fetch history', error);
        }

        setOpenDialogAdd(!openDialogAdd);
    };

    const handleDialogToggleDeleteClose = () => {
        setIsLoadingDelete(false);
        setOpenDialogAdd(false);
    };

    const handleDialogToggleApproval = rowData => {
        setDataApproval(rowData);
        setOpenDialogApproval(true);
    };

    const handleDialogToggleApprovalClose = () => {
        setOpenDialogApproval(false);
    };

    const handleFilter = useCallback(val => {
        updateData('filterData', val);
        updateData('page', 1);
    }, []);

    useEffect(() => {
        const initData = async () => {
            updateData('loading', true);

            const dataForm = JSON.stringify({
                limit: data.pageSize,
                page: data.page,
                sort: data.sort,
                filterData: data.filterData,
                company: 'SUJD'
            });

            await backendApi.post('/web/items', dataForm)
                .then(response => {
                    updateData('rowCount', response.data.total);
                    setTimeout(() => {
                        updateData('rows', response.data.data || []);
                        updateData('loading', false);
                    }, 100);
                })
                .catch(error => {
                    console.log(error);
                    updateData('loading', false);
                });
        };

        initData();
    }, [data.page, data.pageSize, data.sort, data.filterData, data.reload]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const typeResponse = await backendApi.post('http://apidev.samora.co.id/api/samora-srv2/dynamic/master-data/ProductCategoriesGet', {
                    ParentProductCategoryCode: ""
                });
                setTypeOptions(typeResponse.data.data || []);

                const categoryResponse = await backendApi.post('http://apidev.samora.co.id/api/samora-srv2/dynamic/master-data/ProductCategoriesGet', {
                    ParentProductCategoryCode: ""
                });
                setCategoryOptions(categoryResponse.data.data || []);
            } catch (error) {
                console.error("Failed to fetch options", error);
            }
        };

        fetchOptions();
    }, []);

    const statusMapping = {
        'Approve': { label: 'Approve', color: 'success' },
        'Reject': { label: 'Reject', color: 'error' },
        'Need Approve': { label: 'Need Approve', color: 'warning' }
    };

    const renderStatusBadge = (params) => {
        const status = statusMapping[params.value] || {};
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="100%"
            >
                <Badge
                    badgeContent={status.label || params.value}
                    color={status.color || 'default'}
                    sx={{
                        '& .MuiBadge-badge': {
                            right: 10,
                            fontSize: '0.75rem',
                            height: 20,
                            minWidth: 20
                        }
                    }}
                />
            </Box>
        );
    };

    const columns = [
        {
            field: 'trans_type',
            flex: 1,
            minWidth: 150,
            sortable: false,
            filterable: false,
            disableColumnMenu: true,
            renderCell: row => row.trans_type,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Trans Type</Typography>
        },
        {
            field: 'item_code',
            flex: 1,
            minWidth: 120,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Item Code</Typography>
        },
        {
            field: 'item_description',
            flex: 1,
            minWidth: 200,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Item Description</Typography>
        },
        {
            field: 'uom',
            flex: 1,
            minWidth: 70,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>UoM</Typography>
        },
        {
            field: 'status_cotte',
            flex: 1,
            minWidth: 150,
            renderCell: renderStatusBadge,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Status COTTE</Typography>
        },
        {
            field: 'status',
            flex: 1,
            minWidth: 150,
            renderCell: renderStatusBadge,
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Status FICO</Typography>
        },
        {
            field: 'actions',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box display="flex" justifyContent="space-between">
                    <IconButton onClick={() => handleDialogToggleApproval(params.row)}>
                        <Icon icon='mdi:eye-outline' />
                    </IconButton>
                    <Link href={`/item/suj-registration/form/${params.row.id_item}`} passHref>
                        <IconButton component="a">
                            <Icon icon='mdi:pencil' />
                        </IconButton>
                    </Link>
                    <IconButton onClick={() => handleDialogToggleDelete(params.row)}>
                        <Icon icon='mdi:history' />
                    </IconButton>
                </Box>
            ),
            renderHeader: () => <Typography sx={{ fontWeight: 'bold' }}>Actions</Typography>
        }
    ];

    const columnMapping = {
        item_type: 'Item Group',
        uom: 'Uom',
        ditem_type: 'Item Type',
        ditem_category: 'Item Category',
        item_description: 'Description',
        sub_type: 'Sub Type',
        dimension: 'Dimension',
        storage: 'Storage',
        reservation: 'Reservation',
        item_model: 'Item Model',
        product_group: 'Product Group',
        findim: 'Findim'
    };

    return (
        <Grid container spacing={6}>
            <PageHeader
                title={<Typography variant='h5'>SUJ Registration</Typography>}
                subtitle={<Typography variant='body2'>List of all SUJ registrations</Typography>}
            />
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
                    <Button sx={{ mb: 2.5 }} component={Link} variant='contained' href='/item/suj-registration/form' size='small'>
                        Create Menu
                    </Button>
                    <TextField
                        type={'search'}
                        size='small'
                        sx={{ mr: 4, mb: 2.5 }}
                        placeholder='Search'
                        onChange={e => handleFilter(e.target.value)}
                    />
                    </Box>
                    <DataGrid
                        autoHeight
                        rows={data.rows.length ? data.rows : []}
                        columns={columns}
                        getRowId={(row) => row.id_item}
                        rowCount={data.rowCount}
                        loading={data.loading}
                        page={data.page - 1}
                        pageSize={data.pageSize}
                        paginationMode='server'
                        rowsPerPageOptions={data.rowsPerPageOptions}
                        disableSelectionOnClick
                        onPageSizeChange={(newPageSize) => updateData('pageSize', newPageSize)}
                        onPageChange={(newPage) => updateData('page', newPage + 1)}
                        onSortModelChange={(newSortModel) => {
                            if (newSortModel.length > 0) {
                                const { field, sort } = newSortModel[0];
                                const column = columnMapping[field] || field;
                                updateData('sort', { column, order: sort.toUpperCase() });
                            } else {
                                updateData('sort', null);
                            }
                        }}
                    />
                </Card>
            </Grid>
            <Dialog
                open={openDialogAdd}
                onClose={handleDialogToggleDeleteClose}
                aria-labelledby='user-history-dialog-title'
                aria-describedby='user-history-dialog-description'
                maxWidth='md'
                fullWidth
            >
                <DialogTitle id='user-history-dialog-title' sx={{ backgroundColor: '#787EFF', color: '#fff' }}>
                    User Action History
                </DialogTitle>
                <DialogContent>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Time</TableCell>
                                    <TableCell>By</TableCell>
                                    <TableCell>Message</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {historyData.map((history, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{history.type}</TableCell>
                                        <TableCell>
                                            {(() => {
                                                const date = new Date(history.created_date);
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const month = date.toLocaleString('default', { month: 'long' });
                                                const year = date.getFullYear();
                                                const hours = String(date.getHours()).padStart(2, '0');
                                                const minutes = String(date.getMinutes()).padStart(2, '0');
                                                const seconds = String(date.getSeconds()).padStart(2, '0');

                                                return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
                                            })()}
                                        </TableCell>
                                        <TableCell>{history.created_by}</TableCell>
                                        <TableCell>{history.message}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
                <Box display='flex' justifyContent='flex-end' padding={2} sx={{ backgroundColor: '#f5f5f5' }}>
                    <Button onClick={handleDialogToggleDeleteClose} color='secondary' variant='outlined'>
                        Close
                    </Button>
                </Box>
            </Dialog>
            <Dialog
                open={openDialogApproval}
                onClose={handleDialogToggleApprovalClose}
                aria-labelledby='approval-dialog-title'
                aria-describedby='approval-dialog-description'
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle id='approval-dialog-title'>Detail Item</DialogTitle>
                <DialogContent>
                    <Box display="flex" justifyContent="flex-start" mb={2}>
                    </Box>
                    <TableContainer>
                        <Table>
                            <TableBody>
                                {Object.entries(dataApproval).map(([key, value]) => (
                                    // Menggunakan pemetaan untuk mendapatkan nama kolom yang sesuai
                                    columnMapping[key] ? (
                                        <TableRow key={key}>
                                            <TableCell style={{ border: "1px solid black" }}>
                                                {columnMapping[key]}
                                            </TableCell>
                                            <TableCell style={{ border: "1px solid black" }}>
                                                {value}
                                            </TableCell>
                                        </TableRow>
                                    ) : null // Jika tidak ada pemetaan untuk kunci ini, tidak menampilkan baris
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </Grid>
    );
};

SUJRegistration.acl = {
    action: 'manage',
    subject: 'suj-registration'
};

export default SUJRegistration;
