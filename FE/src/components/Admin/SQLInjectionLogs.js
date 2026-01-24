import React, { useEffect } from 'react';
import "./ProductList.css";
import { useDispatch, useSelector } from "react-redux";
import { getMyLogs, clearError, getLogsDetails } from "../../redux/actions/logActions";
import { useAlert } from "react-alert";
import { DataGrid } from '@mui/x-data-grid';
import MetaData from "../layout/MetaData";
import { Link, useNavigate } from "react-router-dom";
import { Edit, Delete } from "@mui/icons-material"
import { Button } from '@mui/material';
import SideBar from "./Sidebar";
import { Doughnut } from 'react-chartjs-2';


const Sqli = () => {
      const { logs, error } = useSelector(state => state.logs);
      const { logsDetails } = useSelector(state => state.myLogsCounts);
      const { error: deleteError, isDeleted } = useSelector(state => state.logs);
      const dispatch = useDispatch();
      const alert = useAlert();
      const history = useNavigate()
      console.log({ logsDetails })

      useEffect(() => {
            if (error) {
                  alert.error(error);
                  dispatch(clearError());
            }
            if (deleteError) {
                  alert.error(deleteError);
                  dispatch(clearError());
            }

      }, [error, deleteError, isDeleted, alert, dispatch, history]);

      useEffect(() => {
            dispatch(getMyLogs());
            dispatch(getLogsDetails());
      }, [dispatch]);

      const columns = [
            {
                  field: "id",
                  headerName: "Log ID",
                  minWidth: 100,
                  flex: 0.3,
            },
            {
                  field: "method",
                  headerName: "Method",
                  minWidth: 120,
                  flex: 0.3,
            },
            {
                  field: "route",
                  headerName: "Route",
                  minWidth: 350,
                  flex: 1,
            },
            {
                  field: "ip",
                  headerName: "IP Address",
                  minWidth: 150,
                  flex: 0.4,
            },
            {
                  field: "attackType",
                  headerName: "Attack Type",
                  minWidth: 150,
                  flex: 0.4,
            },
            {
                  field: "confidence",
                  headerName: "Confidence",
                  minWidth: 150,
                  flex: 0.4,
                  renderCell: (params) => (

                        <span
                              style={{
                                    color: params.value >= 0.8 ? "red" : "orange",
                                    fontWeight: "bold",
                              }}
                        >
                              {params.value.toFixed(2)}
                        </span>
                  ),
            },
            {
                  field: "createdAt",
                  headerName: "Created At",
                  minWidth: 200,
                  flex: 0.5,
            },
            // {
            //       field: "actions",
            //       headerName: "Actions",
            //       minWidth: 120,
            //       flex: 0.3,
            //       sortable: false,
            //       renderCell: (params) => (
            //             <Link to={`/admin/logs/${params.row.id}`}>
            //                   <Edit />
            //             </Link>
            //       ),
            // },
      ];


      const rows = [];

      logs &&
            logs.forEach((item) => {
                  rows.push({
                        id: item.id,
                        method: item.method,
                        route: item.route,
                        ip: item.ip,
                        attackType: item.attackType,
                        confidence: item.confidence,
                        createdAt: new Date(item.createdAt).toLocaleString(),
                  });
            });

      const doughnutState = {
            labels: ["SQL Injection", "XSS"],
            datasets: [
                  {
                        backgroundColor: ["#00A6B4", "#6800B4"],
                        hoverBackgroundColor: ["#4B5000", "#35014F"],
                        data: [logsDetails.sqliCount, logsDetails.xssCount],
                  },
            ],
      };


      return (
            <>
                  <MetaData title={`ALL Logs - Admin`} />

                  <div className="dashboard">
                        <SideBar />
                        <div className="productListContainer">
                              <h1 id="productListHeading">ALL Logs</h1>
                              <div className="dashboardSummary">
                                    {/* <div>
                                          <p>Total Amount : रू {11 + 12}</p>
                                    </div> */}
                                    <div className="dashboardSummaryBox2">
                                          <a href="#logs" >
                                                <p>Total Attacks</p>
                                                <p>{logsDetails?.totalAttacks}</p>
                                          </a>
                                          <a href="#logs" >
                                                <p>Last 24 Hours</p>
                                                <p>{logsDetails?.last24Hours}</p>
                                          </a>
                                          <a href="#logs" >
                                                <p>High Confidence</p>
                                                <p>{logsDetails?.highConfidenceAttacks}</p>
                                          </a>
                                    </div>
                                    <div className="doughnutChart">
                                          <Doughnut data={doughnutState} />
                                    </div>
                              </div>

                              <div id='logs'>
                                    <DataGrid
                                          rows={rows}
                                          columns={columns}
                                          pageSize={10}
                                          rowsPerPageOptions={[10]}
                                          disableSelectionOnClick
                                          className="productListTable"
                                          autoHeight
                                    />
                              </div>
                        </div>
                  </div>
            </>
      )

}

export default Sqli;